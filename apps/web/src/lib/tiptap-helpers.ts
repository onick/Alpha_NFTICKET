// Helper functions for TipTap content processing

export const extractHashtags = (htmlContent: string): string[] => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // Find all hashtag elements
  const hashtagElements = doc.querySelectorAll('span[data-hashtag]')
  const hashtags: string[] = []
  
  hashtagElements.forEach((element) => {
    const text = element.textContent
    if (text && text.startsWith('#')) {
      hashtags.push(text)
    }
  })
  
  // Also extract hashtags from plain text using regex as fallback
  const plainText = doc.body.textContent || ''
  const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
  const matches = plainText.match(hashtagRegex) || []
  
  // Combine and deduplicate
  const combinedHashtags = hashtags.concat(matches)
  const uniqueHashtags = combinedHashtags.filter((hashtag, index) => 
    combinedHashtags.indexOf(hashtag) === index
  )
  return uniqueHashtags
}

export const extractMentions = (htmlContent: string): string[] => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // Find all mention elements
  const mentionElements = doc.querySelectorAll('span[data-type="mention"]')
  const mentions: string[] = []
  
  mentionElements.forEach((element) => {
    const id = element.getAttribute('data-id')
    const label = element.getAttribute('data-label')
    if (id) {
      mentions.push(`@${label || id}`)
    }
  })
  
  return mentions
}

export const getPlainTextLength = (htmlContent: string): number => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  return doc.body.textContent?.length || 0
}

export const htmlToPlainText = (htmlContent: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  return doc.body.textContent || ''
}

// Convert TipTap HTML content to display-friendly text
export const processContentForDisplay = (htmlContent: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // Process mentions - replace with @username format
  const mentionElements = doc.querySelectorAll('span[data-type="mention"]')
  mentionElements.forEach((element) => {
    const id = element.getAttribute('data-id')
    const label = element.getAttribute('data-label')
    const username = label || id
    if (username) {
      element.textContent = `@${username}`
    }
  })
  
  // Process hashtags - ensure they start with #
  const hashtagElements = doc.querySelectorAll('span[data-hashtag]')
  hashtagElements.forEach((element) => {
    const text = element.textContent
    if (text && !text.startsWith('#')) {
      element.textContent = `#${text}`
    }
  })
  
  return doc.body.textContent || ''
}