import React, { useState, useEffect } from 'react'

const RetryableImage = ({
  src,
  alt,
  className,
  maxRetries = 3,
  retryDelay = 1000,
  fallbackSrc,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [retries, setRetries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Reset state when source changes
  useEffect(() => {
    setCurrentSrc(src)
    setRetries(0)
    setLoading(true)
    setError(false)
  }, [src])

  const handleError = () => {
    if (retries < maxRetries) {
      const delay = retryDelay * (retries + 1)

      setTimeout(() => {
        setCurrentSrc(`${src}?retry=${Date.now()}`)
        setRetries((prev) => prev + 1)
      }, delay)
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <>
      {(loading || error) && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={`Loading ${alt}`}
          className={className}
          style={{ display: 'block' }}
          {...props}
        />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        onLoad={() => {
          setLoading(false)
          setError(false)
        }}
        onError={handleError}
        style={{
          display: !fallbackSrc || (!loading && !error) ? 'block' : 'none',
        }}
        {...props}
      />
    </>
  )
}

export default RetryImage
