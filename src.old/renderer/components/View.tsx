import styled from 'styled-components'
import { FlexboxProps, flexbox } from 'styled-system'

const View = styled.div<FlexboxProps>(
  {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexbox
)

export default View

export const StackedView = styled(View)({
  flexDirection: 'column',
  '> *': {
    flex: 1,
  },
})
