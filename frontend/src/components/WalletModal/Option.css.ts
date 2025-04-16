import { style } from '@vanilla-extract/css'

export const option = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',

  ':hover': {
    backgroundColor: '#f5f5f5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
})

export const icon = style({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

export const name = style({
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
})
