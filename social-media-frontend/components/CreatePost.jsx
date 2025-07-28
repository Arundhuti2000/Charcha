import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Star } from 'lucide-react'
import api from '../services/api'

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    published: true,
    rating: null
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()

  const categories = [
    'Technology',
    'Sports',
    'Entertainment',
    'News',
    'Lifestyle',
    'Education',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length > 1000) {
      newErrors.content = 'Content must be 1000 characters or less'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await api.post('/posts/', formData)
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      setErrors({ 
        general: error.response?.data?.detail || 'Failed to create post. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <PlusCircle className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Create New Post</h1>
          </div>
          <p className="mt-2 text-blue-100">Share your thoughts with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter an engaging title for your post..."
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.title.length}/100 characters
              </p>
            </div>
          </div>

          {/* Category and Rating Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (Optional)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    className={`p-1 rounded transition-colors ${
                      formData.rating && rating <= formData.rating
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                {formData.rating && (
                  <span className="text-sm text-gray-600 ml-2">
                    {formData.rating}/5 stars
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
              placeholder="Write your post content here..."
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.content.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
            <span className="text-sm text-gray-500">
              (Uncheck to save as draft)
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost