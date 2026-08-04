import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  imageClassName?: string;
  inverted?: boolean;
}

export function BrandLogo({
  href = '/',
  imageClassName = 'h-12 w-auto',
  inverted = false,
}: BrandLogoProps) {
  return (
    <Link href={href} className="flex items-center no-underline group">
      <Image
        src="/logo.png"
        alt="Sri Lanka Railways"
        width={622}
        height={401}
        className={`${imageClassName} group-hover:opacity-90 transition-opacity${inverted ? ' brightness-0 invert' : ''}`}
        priority
      />
    </Link>
  );
}
