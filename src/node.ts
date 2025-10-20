import * as NodeRED from 'node-red'

interface TrafficLightNodeConfiguration extends NodeRED.NodeDef {
	transitionSpeedMilliseconds: number
	outputOnConnect: boolean
	start: 'green' | 'red'
}

type ColorState = 'on' | 'off'
type State = 'green' | 'yellow' | 'red' | 'red+yellow'

export = function (RED: NodeRED.NodeAPI) {
	function TrafficLightNode(
		this: NodeRED.Node,
		configuration: TrafficLightNodeConfiguration,
	) {
		RED.nodes.createNode(this, configuration)

		let state: State = configuration.start
		let currentSimpleState = state === 'green'
		let targetSimpleState = currentSimpleState
		let transitionTimer: null | ReturnType<typeof setTimeout> = null

		const sendCurrentStateCommand = () => {
			const getSingleLightStatePayload = (state: ColorState) => ({
				state,
				on: state === 'on',
				off: state === 'off',
			})
			this.send({
				payload: {
					state,
					red: getSingleLightStatePayload(
						state === 'red' || state === 'red+yellow' ? 'on' : 'off',
					),
					yellow: getSingleLightStatePayload(
						state === 'yellow' || state === 'red+yellow' ? 'on' : 'off',
					),
					green: getSingleLightStatePayload(state === 'green' ? 'on' : 'off'),
				},
			})
			this.status({
				fill: state === 'red+yellow' ? 'yellow' : state,
				shape: 'dot',
				text: state,
			})
		}

		const clearTransitionTimer = () => {
			if (transitionTimer) {
				clearTimeout(transitionTimer)
				transitionTimer = null
			}
		}

		const startTransition = () => {
			state = state === 'green' ? 'yellow' : 'red+yellow'
			sendCurrentStateCommand()
			transitionTimer = setTimeout(() => {
				state = state === 'yellow' ? 'red' : 'green'
				sendCurrentStateCommand()
				transitionTimer = setTimeout(() => {
					currentSimpleState = state === 'green'
					if (currentSimpleState === targetSimpleState) {
						transitionTimer = null
					} else {
						startTransition()
					}
				}, configuration.transitionSpeedMilliseconds)
			}, configuration.transitionSpeedMilliseconds)
		}

		if (configuration.outputOnConnect) {
			setTimeout(() => {
				sendCurrentStateCommand()
			})
		}

		this.on('close', () => {
			clearTransitionTimer()
			this.status({})
		})

		this.on('input', (message: any, _send, done) => {
			targetSimpleState =
				message.payload === 'on' ||
				message.payload === 'true' ||
				message.payload === 'y' ||
				message.payload === 'yes' ||
				message.payload === true ||
				message.payload === 1
					? true
					: message.payload === 'off' ||
					  message.payload === 'false' ||
					  message.payload === 'n' ||
					  message.payload === 'no' ||
					  message.payload === false ||
					  message.payload === 0
					? false
					: targetSimpleState
			if (
				targetSimpleState !== currentSimpleState &&
				transitionTimer === null
			) {
				startTransition()
			} else if (transitionTimer === null) {
				sendCurrentStateCommand()
			}
			if (done) {
				done()
			}
		})
	}

	RED.nodes.registerType('traffic light', TrafficLightNode)
}
