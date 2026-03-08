'use client';

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: 'filled' | 'outline' | 'ghost';
}

export const DEFAULT_THEME: FormTheme = {
  primaryColor: '#000000',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  fontFamily: 'inherit',
  borderRadius: '12px',
  buttonStyle: 'filled',
};
