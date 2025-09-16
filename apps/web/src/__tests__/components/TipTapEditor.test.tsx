import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TipTapEditor, { TipTapEditorRef } from '../../components/TipTapEditor'

// Mock TipTap hooks and components
const mockEditor = {
  getHTML: jest.fn(() => '<p>Test content</p>'),
  getText: jest.fn(() => 'Test content'),
  commands: {
    setContent: jest.fn(),
    focus: jest.fn(),
  },
}

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">
      {editor ? 'Editor loaded' : 'Loading...'}
    </div>
  ),
}))

// Mock TipTap extensions
jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({ name: 'StarterKit' })),
  },
}))

jest.mock('@tiptap/extension-mention', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({ name: 'Mention' })),
  },
}))

// Mock custom extensions
jest.mock('../../components/extensions/hashtag-extension', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({ name: 'HashtagExtension' })),
  },
}))

// Mock mention suggestion
jest.mock('../../components/mention/suggestion', () => ({
  __esModule: true,
  default: {},
}))

describe('TipTapEditor', () => {
  const defaultProps = {
    placeholder: 'Test placeholder',
    maxLength: 280,
    onUpdate: jest.fn(),
    onKeyDown: jest.fn(),
    onImageUpload: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockEditor.getText.mockReturnValue('Test content')
    mockEditor.getHTML.mockReturnValue('<p>Test content</p>')
  })

  describe('Rendering', () => {
    it('should render loading state when not client-side', () => {
      // Mock useState to simulate server-side rendering
      const mockUseState = jest.spyOn(React, 'useState')
      mockUseState.mockImplementationOnce(() => [false, jest.fn()]) // isClient = false

      render(<TipTapEditor {...defaultProps} />)

      expect(screen.getByText('0/280')).toBeInTheDocument()
      // Should show loading animation
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should render editor when client-side and editor is available', () => {
      render(<TipTapEditor {...defaultProps} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
      expect(screen.getByText('Editor loaded')).toBeInTheDocument()
    })

    it('should display custom placeholder', () => {
      const customPlaceholder = 'Custom placeholder text'
      mockEditor.getText.mockReturnValue('')

      render(<TipTapEditor {...defaultProps} placeholder={customPlaceholder} />)

      expect(screen.getByText(customPlaceholder)).toBeInTheDocument()
    })

    it('should hide placeholder when there is content', () => {
      mockEditor.getText.mockReturnValue('Some content')

      render(<TipTapEditor {...defaultProps} />)

      expect(screen.queryByText(defaultProps.placeholder)).not.toBeInTheDocument()
    })
  })

  describe('Character counting', () => {
    it('should display current character count', () => {
      mockEditor.getText.mockReturnValue('Hello world')

      render(<TipTapEditor {...defaultProps} />)

      expect(screen.getByText('11/280')).toBeInTheDocument()
    })

    it('should show warning color when near limit', () => {
      mockEditor.getText.mockReturnValue('a'.repeat(225)) // 80% of 280

      render(<TipTapEditor {...defaultProps} />)

      const counter = screen.getByText('225/280')
      expect(counter).toHaveClass('text-yellow-400')
    })

    it('should show error color when over limit', () => {
      mockEditor.getText.mockReturnValue('a'.repeat(300))

      render(<TipTapEditor {...defaultProps} />)

      const counter = screen.getByText('300/280')
      expect(counter).toHaveClass('text-red-400')
    })

    it('should display circular progress indicator', () => {
      mockEditor.getText.mockReturnValue('Hello')

      render(<TipTapEditor {...defaultProps} />)

      // Should show progress circle when there's content
      const progressCircles = screen.getAllByRole('img', { hidden: true })
      expect(progressCircles.length).toBeGreaterThan(0)
    })
  })

  describe('Toolbar buttons', () => {
    it('should render all toolbar buttons', () => {
      render(<TipTapEditor {...defaultProps} />)

      expect(screen.getByTitle('Agregar imagen')).toBeInTheDocument()
      expect(screen.getByTitle('Tomar foto')).toBeInTheDocument()
      expect(screen.getByTitle('Agregar ubicación')).toBeInTheDocument()
      expect(screen.getByTitle('Agregar emoji')).toBeInTheDocument()
    })

    it('should trigger file input when image button is clicked', async () => {
      const user = userEvent.setup()

      // Mock document.createElement
      const mockInput = {
        type: '',
        accept: '',
        click: jest.fn(),
        onchange: null,
      }
      const mockCreateElement = jest.spyOn(document, 'createElement')
      mockCreateElement.mockReturnValue(mockInput as any)

      render(<TipTapEditor {...defaultProps} />)

      const imageButton = screen.getByTitle('Agregar imagen')
      await user.click(imageButton)

      expect(mockCreateElement).toHaveBeenCalledWith('input')
      expect(mockInput.type).toBe('file')
      expect(mockInput.accept).toBe('image/*')
      expect(mockInput.click).toHaveBeenCalled()

      mockCreateElement.mockRestore()
    })
  })

  describe('Image upload functionality', () => {
    it('should show uploading state when image is being uploaded', async () => {
      const user = userEvent.setup()
      const onImageUpload = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

      const mockInput = {
        type: '',
        accept: '',
        click: jest.fn(),
        onchange: null,
      }
      const mockCreateElement = jest.spyOn(document, 'createElement')
      mockCreateElement.mockReturnValue(mockInput as any)

      render(<TipTapEditor {...defaultProps} onImageUpload={onImageUpload} />)

      const imageButton = screen.getByTitle('Agregar imagen')
      await user.click(imageButton)

      // Simulate file selection
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockInput, 'files', { value: [file] })
      
      if (mockInput.onchange) {
        mockInput.onchange({ target: mockInput } as any)
      }

      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByTitle('Subiendo imagen...')).toBeInTheDocument()
      })

      mockCreateElement.mockRestore()
    })

    it('should display uploaded images', async () => {
      const onImageUpload = jest.fn(() => Promise.resolve('http://example.com/image.jpg'))

      const mockInput = {
        type: '',
        accept: '',
        click: jest.fn(),
        onchange: null,
      }
      const mockCreateElement = jest.spyOn(document, 'createElement')
      mockCreateElement.mockReturnValue(mockInput as any)

      render(<TipTapEditor {...defaultProps} onImageUpload={onImageUpload} />)

      const imageButton = screen.getByTitle('Agregar imagen')
      await userEvent.click(imageButton)

      // Simulate file selection
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockInput, 'files', { value: [file] })
      
      if (mockInput.onchange) {
        mockInput.onchange({ target: mockInput } as any)
      }

      await waitFor(() => {
        expect(screen.getByAltText('Uploaded image 1')).toBeInTheDocument()
      })

      mockCreateElement.mockRestore()
    })

    it('should allow removing uploaded images', async () => {
      const user = userEvent.setup()
      const onImageUpload = jest.fn(() => Promise.resolve('http://example.com/image.jpg'))

      const mockInput = {
        type: '',
        accept: '',
        click: jest.fn(),
        onchange: null,
      }
      const mockCreateElement = jest.spyOn(document, 'createElement')
      mockCreateElement.mockReturnValue(mockInput as any)

      render(<TipTapEditor {...defaultProps} onImageUpload={onImageUpload} />)

      // Upload an image first
      const imageButton = screen.getByTitle('Agregar imagen')
      await user.click(imageButton)

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockInput, 'files', { value: [file] })
      
      if (mockInput.onchange) {
        mockInput.onchange({ target: mockInput } as any)
      }

      await waitFor(() => {
        expect(screen.getByAltText('Uploaded image 1')).toBeInTheDocument()
      })

      // Remove the image
      const removeButton = screen.getByTitle('Remove image')
      await user.click(removeButton)

      expect(screen.queryByAltText('Uploaded image 1')).not.toBeInTheDocument()

      mockCreateElement.mockRestore()
    })
  })

  describe('Ref functionality', () => {
    it('should expose ref methods correctly', () => {
      const ref = React.createRef<TipTapEditorRef>()

      render(<TipTapEditor {...defaultProps} ref={ref} />)

      expect(ref.current).not.toBeNull()
      expect(ref.current?.getContent).toBeDefined()
      expect(ref.current?.setContent).toBeDefined()
      expect(ref.current?.focus).toBeDefined()
      expect(ref.current?.getCharacterCount).toBeDefined()
      expect(ref.current?.getUploadedImages).toBeDefined()
      expect(ref.current?.clearUploadedImages).toBeDefined()
    })

    it('should return correct content from getContent', () => {
      const ref = React.createRef<TipTapEditorRef>()
      mockEditor.getHTML.mockReturnValue('<p>Test HTML content</p>')

      render(<TipTapEditor {...defaultProps} ref={ref} />)

      expect(ref.current?.getContent()).toBe('<p>Test HTML content</p>')
    })

    it('should set content via setContent', () => {
      const ref = React.createRef<TipTapEditorRef>()

      render(<TipTapEditor {...defaultProps} ref={ref} />)

      ref.current?.setContent('<p>New content</p>')

      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('<p>New content</p>')
    })

    it('should focus editor via focus method', () => {
      const ref = React.createRef<TipTapEditorRef>()

      render(<TipTapEditor {...defaultProps} ref={ref} />)

      ref.current?.focus()

      expect(mockEditor.commands.focus).toHaveBeenCalled()
    })

    it('should return character count', () => {
      const ref = React.createRef<TipTapEditorRef>()
      mockEditor.getText.mockReturnValue('Hello world')

      render(<TipTapEditor {...defaultProps} ref={ref} />)

      expect(ref.current?.getCharacterCount()).toBe(11)
    })
  })

  describe('Callbacks', () => {
    it('should call onUpdate when content changes', () => {
      const onUpdate = jest.fn()

      render(<TipTapEditor {...defaultProps} onUpdate={onUpdate} />)

      // The onUpdate should be called during editor setup
      expect(onUpdate).toHaveBeenCalled()
    })

    it('should validate image files before upload', async () => {
      const user = userEvent.setup()
      const onImageUpload = jest.fn()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockInput = {
        type: '',
        accept: '',
        click: jest.fn(),
        onchange: null,
      }
      const mockCreateElement = jest.spyOn(document, 'createElement')
      mockCreateElement.mockReturnValue(mockInput as any)

      render(<TipTapEditor {...defaultProps} onImageUpload={onImageUpload} />)

      const imageButton = screen.getByTitle('Agregar imagen')
      await user.click(imageButton)

      // Try to upload a non-image file
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(mockInput, 'files', { value: [file] })
      
      if (mockInput.onchange) {
        mockInput.onchange({ target: mockInput } as any)
      }

      expect(consoleSpy).toHaveBeenCalledWith('File is not an image')
      expect(onImageUpload).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
      mockCreateElement.mockRestore()
    })

    it('should validate file size before upload', async () => {
      const user = userEvent.setup()
      const onImageUpload = jest.fn()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockInput = {
        type: '',
        accept: '',
        click: jest.fn(),
        onchange: null,
      }
      const mockCreateElement = jest.spyOn(document, 'createElement')
      mockCreateElement.mockReturnValue(mockInput as any)

      render(<TipTapEditor {...defaultProps} onImageUpload={onImageUpload} />)

      const imageButton = screen.getByTitle('Agregar imagen')
      await user.click(imageButton)

      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(mockInput, 'files', { value: [largeFile] })
      
      if (mockInput.onchange) {
        mockInput.onchange({ target: mockInput } as any)
      }

      expect(consoleSpy).toHaveBeenCalledWith('Image file too large (max 5MB)')
      expect(onImageUpload).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
      mockCreateElement.mockRestore()
    })
  })
})