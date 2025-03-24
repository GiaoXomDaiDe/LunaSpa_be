import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './ProductDemo.css'

const ProductDemo = () => {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Lấy danh sách sản phẩm thực từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/products')
        if (response.data && response.data.result) {
          const productData = response.data.result.data
          setProducts(productData)

          // Tạo danh sách categories từ products
          const uniqueCategories = [...new Set(productData.map((p) => p.category_name || 'Khác'))]
          setCategories(['Tất cả', ...uniqueCategories])
        } else {
          // Fallback sang sản phẩm demo nếu API không trả về đúng định dạng
          setProducts([])
          setError('Không thể lấy dữ liệu sản phẩm từ máy chủ')
        }
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm từ API:', err)
        // Fallback sang sản phẩm demo nếu API lỗi
        setProducts([])
        setError('Lỗi kết nối máy chủ, hiển thị sản phẩm demo')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleProductSelect = (product) => {
    setSelectedProduct(product)

    // Scroll đến thông tin sản phẩm đã chọn
    setTimeout(() => {
      document.querySelector('.selected-product-details')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }, 100)
  }

  // Lọc sản phẩm theo danh mục
  const filteredProducts =
    selectedCategory && selectedCategory !== 'Tất cả'
      ? products.filter((p) => p.category_name === selectedCategory)
      : products

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x200?text=Luna+Spa'
  }

  if (loading) {
    return <div className='loading-container'>Đang tải sản phẩm...</div>
  }

  // Hiển thị số sao đánh giá
  const renderRating = (rating) => {
    return (
      <div className='product-rating'>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : ''}`}>
            ★
          </span>
        ))}
        <span className='rating-number'>{rating}</span>
      </div>
    )
  }

  return (
    <div className='product-demo-container'>
      <div className='product-demo-header'>
        <h2>Luna Spa - Dịch Vụ Của Chúng Tôi</h2>
        <p>Hãy chọn một dịch vụ để thanh toán</p>

        {/* Bộ lọc danh mục */}
        {categories.length > 0 && (
          <div className='category-filter'>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className='notification warning'>{error}</div>}

      <div className='product-grid'>
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className={`product-card ${selectedProduct?._id === product._id ? 'selected' : ''}`}
            onClick={() => handleProductSelect(product)}
          >
            <div className='product-image'>
              <img src={product.images?.[0] || product.media?.[0]?.url} alt={product.name} onError={handleImageError} />
              {product.is_popular && <span className='badge popular'>Phổ biến</span>}
              {product.is_new && <span className='badge new'>Mới</span>}
              {product.discount_percent > 0 && <span className='badge discount'>-{product.discount_percent}%</span>}
            </div>
            <div className='product-info'>
              <h3>{product.name}</h3>
              <p>{product.description || product.short_description}</p>

              {/* Hiển thị rating nếu có */}
              {product.rating && renderRating(product.rating)}

              <div className='product-footer'>
                <div className='product-price'>{formatCurrency(product.price || product.base_price)}</div>
                {product.original_price && (
                  <div className='product-original-price'>{formatCurrency(product.original_price)}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className='empty-result'>
          <p>Không tìm thấy sản phẩm nào phù hợp</p>
          <button onClick={() => setSelectedCategory('Tất cả')}>Xem tất cả sản phẩm</button>
        </div>
      )}

      {selectedProduct && (
        <div className='selected-product-details'>
          <h3>Dịch vụ đã chọn:</h3>
          <div className='selected-detail'>
            <span className='detail-label'>Tên dịch vụ:</span>
            <span className='detail-value'>{selectedProduct.name}</span>
          </div>
          {selectedProduct.category_name && (
            <div className='selected-detail'>
              <span className='detail-label'>Danh mục:</span>
              <span className='detail-value'>{selectedProduct.category_name}</span>
            </div>
          )}
          <div className='selected-detail'>
            <span className='detail-label'>Giá:</span>
            <span className='detail-value'>{formatCurrency(selectedProduct.price || selectedProduct.base_price)}</span>
          </div>
          {selectedProduct.duration && (
            <div className='selected-detail'>
              <span className='detail-label'>Thời gian:</span>
              <span className='detail-value'>{selectedProduct.duration} phút</span>
            </div>
          )}
          <Link to={`/checkout/${selectedProduct._id}`} className='checkout-button'>
            Tiến hành thanh toán
          </Link>
        </div>
      )}
    </div>
  )
}

export default ProductDemo
