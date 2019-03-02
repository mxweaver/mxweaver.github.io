import React, { Component } from 'react'
import produce from 'immer'
import classnames from 'classnames'
import animate, { WrappedProps } from '../../hoc/animate'
import c from './Playground.scss'

interface Point {
  x: number;
  y: number;
}

interface Circle extends Point {
  radius: number;
}

interface Props extends WrappedProps {
  className?: string;
}

interface State {
  circles: Circle[];
  selectedCircleId?: number;
  isNewShape: boolean;
  dragOffset?: Point;
}

class Playground extends Component<Props, State> {
  public state: State = {
    circles: [],
    isNewShape: false
  }

  public componentDidMount() {
    this.props.onReady()
  }

  public componentDidUpdate(prevProps: WrappedProps) {
    if (this.props.step !== prevProps.step) {
      if (this.state.selectedCircleId !== undefined && this.state.isNewShape) {
        this.setState(produce((draft: State) => {
          draft.circles[draft.selectedCircleId].radius++
        }))
      }
    }
  }

  public handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    const { clientX, clientY } = event
    const target = event.target as SVGCircleElement

    if (event.target === event.currentTarget) {
      this.setState(produce((draft: State) => {
        const circle = {
          x: clientX,
          y: clientY,
          radius: 10
        }

        draft.circles.push(circle)
        draft.selectedCircleId = draft.circles.length - 1
        draft.isNewShape = true
        draft.dragOffset = { x: 0, y: 0 }
      }))
    } else {
      this.setState(produce((draft: State) => {
        draft.isNewShape = false
        draft.selectedCircleId = Number(target.getAttribute('data-circle-id'))
        draft.dragOffset = {
          x: clientX - draft.circles[draft.selectedCircleId].x,
          y: clientY - draft.circles[draft.selectedCircleId].y
        }
      }))
    }
  }

  public handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const { clientX, clientY } = event

    if (this.state.selectedCircleId !== undefined) {
      this.setState(produce((draft: State) => {
        draft.circles[draft.selectedCircleId].x = clientX - draft.dragOffset.x
        draft.circles[draft.selectedCircleId].y = clientY - draft.dragOffset.y
      }))
    }
  }

  public handleMouseUp = () => {
    this.setState({
      selectedCircleId: undefined
    })
  }

  public render() {
    const { circles } = this.state

    return (
      <svg
        className={classnames(this.props.className, c.display)}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        {circles.map((c, i) => <circle
          key={i}
          data-circle-id={i}
          r={c.radius}
          cx={c.x}
          cy={c.y}
        />)}
      </svg>
    )
  }
}

export default animate(60)(Playground)
