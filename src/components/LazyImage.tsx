import React from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: () => void;
}

const LazyImage: React.FC<Props> = ({ src, alt, className, referrerPolicy, onClick }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
      onClick={onClick}
      loading="lazy"
      decoding="async"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    />
  );
};

export default LazyImage;
