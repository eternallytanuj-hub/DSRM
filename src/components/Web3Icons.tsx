'use client';

import React from 'react';

export function MetaMaskLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.28 5.76L17.7 13.92L20.24 8.78L29.28 5.76Z" fill="#E17726"/>
      <path d="M2.72 5.76L11.66 8.88L14.3 13.92L2.72 5.76Z" fill="#E27625"/>
      <path d="M25.04 22.86L22.28 27.02L28.38 28.7L30.08 22.98L25.04 22.86Z" fill="#E27625"/>
      <path d="M1.92 22.98L3.62 28.7L9.72 27.02L6.96 22.86L1.92 22.98Z" fill="#E27625"/>
      <path d="M9.44 14.28L7.34 17.44L13.12 17.8L12.94 11.68L9.44 14.28Z" fill="#E27625"/>
      <path d="M22.56 14.28L19.04 11.64L18.88 17.8L24.66 17.44L22.56 14.28Z" fill="#E27625"/>
      <path d="M9.72 27.02L13.1 24.78L10.38 21.36L6.96 22.86L9.72 27.02Z" fill="#E27625"/>
      <path d="M18.9 24.78L22.28 27.02L25.04 22.86L21.62 21.36L18.9 24.78Z" fill="#E27625"/>
      <path d="M22.28 27.02L18.9 24.78L19.26 27.26L19.24 28.58L22.28 27.02Z" fill="#D56421"/>
      <path d="M9.72 27.02L12.76 28.58L12.74 27.26L13.1 24.78L9.72 27.02Z" fill="#D56421"/>
      <path d="M16 20.48L13.24 19.38L11.36 21.14L13.1 24.78L13.12 24.8L16 26.24L18.88 24.8L18.9 24.78L20.64 21.14L18.76 19.38L16 20.48Z" fill="#E27625"/>
      <path d="M16 14.88L14.3 13.92L12.94 11.68L12.82 9.06L16 8.24L19.18 9.06L19.06 11.68L17.7 13.92L16 14.88Z" fill="#233447"/>
      <path d="M18.88 17.8L16 18.24L13.12 17.8L12.86 19.46L13.24 19.38L16 20.48L18.76 19.38L19.14 19.46L18.88 17.8Z" fill="#CC621B"/>
      <path d="M19.14 19.46L18.76 19.38L20.64 21.14L21.62 21.36L22.18 19.4L24.66 17.44L18.88 17.8L19.14 19.46Z" fill="#C05C1A"/>
      <path d="M13.24 19.38L12.86 19.46L13.12 17.8L7.34 17.44L9.82 19.4L10.38 21.36L11.36 21.14L13.24 19.38Z" fill="#C05C1A"/>
      <path d="M29.28 5.76L20.24 8.78L19.18 9.06L16 8.24L12.82 9.06L11.66 8.88L2.72 5.76L3.92 11.78L2.72 16.32L9.44 14.28L12.94 11.68L14.3 13.92L16 14.88L17.7 13.92L19.06 11.68L22.56 14.28L29.28 16.32L28.08 11.78L29.28 5.76Z" fill="#E27625"/>
    </svg>
  );
}

export function EthereumDiamond({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#A4B5C6"/>
      <path d="M127.962 0L0 212.32L127.962 287.959V157.348V0Z" fill="#627EEA"/>
      <path d="M127.962 312.89L126.386 314.811V412.306L127.962 416.905L256 236.42L127.962 312.89Z" fill="#A4B5C6"/>
      <path d="M127.962 416.905V312.89L0 236.42L127.962 416.905Z" fill="#627EEA"/>
      <path d="M127.962 287.958L255.923 212.32L127.962 157.348V287.958Z" fill="#4B63BA"/>
      <path d="M0 212.32L127.962 287.958V157.348L0 212.32Z" fill="#4B63BA"/>
    </svg>
  );
}

export function EthereumMonochrome({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 784.37 1277.39" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="currentColor" fillOpacity="0.95" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54" />
      <polygon fill="currentColor" fillOpacity="0.65" points="392.07,0 0,650.54 392.07,882.29 392.07,472.33" />
      <polygon fill="currentColor" fillOpacity="0.95" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89" />
      <polygon fill="currentColor" fillOpacity="0.65" points="392.07,1277.38 392.07,956.52 0,724.89" />
      <polygon fill="currentColor" fillOpacity="0.8" points="392.07,882.29 784.13,650.54 392.07,472.33" />
      <polygon fill="currentColor" fillOpacity="0.45" points="0,650.54 392.07,882.29 392.07,472.33" />
    </svg>
  );
}
