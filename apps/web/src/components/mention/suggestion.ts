import { computePosition, flip, shift } from '@floating-ui/dom'
import { ReactRenderer } from '@tiptap/react'
import MentionList from './MentionList'

// Debouncing function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Cache for API results
const userSearchCache = new Map<string, any[]>()

// Current component reference for updates
let currentSuggestionComponent: any = null

// Search users with API call
const searchUsersAPI = async (query: string): Promise<any[]> => {
  if (!query || query.trim().length === 0) {
    return []
  }

  const cacheKey = query.toLowerCase()
  if (userSearchCache.has(cacheKey)) {
    return userSearchCache.get(cacheKey) || []
  }

  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      console.error('Failed to fetch users:', response.statusText)
      return []
    }

    const users = await response.json()
    
    userSearchCache.set(cacheKey, users)
    
    if (userSearchCache.size > 50) {
      const firstKey = userSearchCache.keys().next().value
      userSearchCache.delete(firstKey)
    }
    
    // Update current suggestion component if it exists
    if (currentSuggestionComponent && users.length > 0) {
      currentSuggestionComponent.updateProps({
        items: users,
        command: currentSuggestionComponent.props.command
      })
    }
    
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Debounced search function
const debouncedSearch = debounce(searchUsersAPI, 300)

const updatePosition = (editor: any, element: HTMLElement) => {
  if (!editor?.view) return

  const virtualElement = {
    getBoundingClientRect: () => {
      const { state } = editor
      const { from, to } = state.selection
      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)
      
      return {
        x: start.left,
        y: start.top,
        top: start.top,
        left: start.left,
        bottom: end.bottom,
        right: end.right,
        width: end.right - start.left,
        height: end.bottom - start.top,
      }
    },
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  }).catch(() => {
    // Fallback positioning if floating-ui fails
    element.style.position = 'absolute'
    element.style.left = '0px'
    element.style.top = '0px'
  })
}

export default {
  // Configuration for the suggestion behavior
  char: '@',
  allowedPrefixes: [' ', '\n'],
  startOfLine: false,
  decorationClass: 'suggestion',
  
  items: ({ query }: { query: string }) => {
    // Return empty array for empty queries
    if (!query || query.trim().length === 0) {
      return []
    }

    // Check cache first for immediate results
    const cacheKey = query.toLowerCase()
    if (userSearchCache.has(cacheKey)) {
      return userSearchCache.get(cacheKey) || []
    }

    // Trigger debounced search (results will update the component through state)
    debouncedSearch(query)

    // Return empty array initially, will be populated after API call
    return []
  },

  render: () => {
    let component: ReactRenderer
    let element: HTMLElement
    let isVisible = false

    return {
      onStart: (props: any) => {
        try {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })

          // Store reference for API updates
          currentSuggestionComponent = component

          if (!props.clientRect) {
            return
          }

          element = component.element as HTMLElement
          element.style.position = 'absolute'
          element.style.zIndex = '1000'
          element.style.visibility = 'visible'
          element.style.pointerEvents = 'auto'
          
          // Add some styling to make it more visible
          element.style.background = '#2b2d31'
          element.style.border = '1px solid #404249'
          element.style.borderRadius = '8px'
          element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'

          document.body.appendChild(element)
          isVisible = true
          updatePosition(props.editor, element)
        } catch (error) {
          console.error('Error starting mention suggestion:', error)
        }
      },

      onUpdate(props: any) {
        try {
          if (component && isVisible) {
            component.updateProps(props)
          }

          if (!props.clientRect || !element || !isVisible) {
            return
          }

          updatePosition(props.editor, element)
        } catch (error) {
          console.error('Error updating mention suggestion:', error)
        }
      },

      onKeyDown(props: any) {
        if (!isVisible || !component) {
          return false
        }

        // Handle escape key
        if (props.event.key === 'Escape') {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element)
          }
          if (component) {
            component.destroy()
          }
          isVisible = false
          return true
        }

        try {
          // Let the MentionList component handle other keys
          const handled = (component?.ref as any)?.onKeyDown?.(props)
          return handled || false
        } catch (error) {
          console.error('Error handling mention keydown:', error)
          return false
        }
      },

      onExit() {
        try {
          isVisible = false
          currentSuggestionComponent = null // Clear reference
          if (element && element.parentNode) {
            element.parentNode.removeChild(element)
          }
          if (component) {
            component.destroy()
          }
        } catch (error) {
          console.error('Error cleaning up mention suggestion:', error)
        }
      },
    }
  },
}