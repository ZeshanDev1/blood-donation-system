'use client';

import Image from 'next/image';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  textClassName?: string;
  showFullName?: boolean;
};

export function BrandMark({ compact = false, className = '', textClassName = '', showFullName = false }: BrandMarkProps) {
  return (
    <div className={`inline-flex flex-nowrap items-center justify-center ${showFullName ? 'gap-4' : 'gap-2'} min-w-fit ${className}`}>
      <div className={`flex shrink-0 items-center justify-center ${compact ? 'h-20 w-20' : 'h-32 w-32'}`}>
        <Image
          src="/logo.PNG"
          alt="QBDS logo"
          width={compact ? 116 : 144}
          height={compact ? 116 : 144}
          className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(220,38,38,0.45)]"
          priority={false}
        />
      </div>

      <div className={`leading-none ${textClassName}`}>
        <div className={`font-black tracking-tight text-red-600 ${compact ? 'text-3xl' : 'text-5xl'} ${showFullName ? '' : 'drop-shadow-[0_2px_10px_rgba(220,38,38,0.35)]'}`}>
          QBDS
        </div>
        {showFullName && (
          <div className={`mt-1 ${compact ? 'text-xs tracking-[0.22em]' : 'text-base tracking-[0.28em]'} font-semibold uppercase text-red-100`}>
            QIMS Blood Donors Society
          </div>
        )}
      </div>
    </div>
  );
}