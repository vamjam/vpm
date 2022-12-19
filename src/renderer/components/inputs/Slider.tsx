import { Fragment, InputHTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'
import shared from './shared'

type SliderProps = InputHTMLAttributes<HTMLInputElement> & {
  children?: ReactNode
}

const Container = styled.input`
  ${shared}
  appearance: none;
  padding: 0;
  height: var(--spacing-2);
  /* background-color: var(--colors-black-a2); */
  background-image: linear-gradient(
    var(--colors-surface-3),
    var(--colors-surface-3)
  );

  &::-webkit-slider-thumb {
    appearance: none;
    background-image: linear-gradient(
      var(--colors-text-3),
      var(--colors-text-3)
    );
    height: var(--spacing-7);
    width: var(--spacing-7);
    border-radius: 50%;
  }
`

export default function Slider({ children, list, ...props }: SliderProps) {
  return (
    <Fragment>
      <Container type="range" list={list} {...props} />
      {children && <datalist id={list}>{children}</datalist>}
    </Fragment>
  )
}
