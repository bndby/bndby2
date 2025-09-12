/**
 *
 */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 *
 */
const Logo: React.FC = () => {
  return (
    <div className="logo">
      <Link href="/">
        <Image
          className="logo__image"
          src="/static/images/logo.svg"
          alt="Logo"
          width={100}
          height={50}
        />
      </Link>
    </div>
  );
};

/**
 *
 */
export default Logo;