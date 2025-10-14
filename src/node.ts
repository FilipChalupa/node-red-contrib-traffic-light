import * as NodeRED from 'node-red'

interface TrafficLightNodeConfiguration extends NodeRED.NodeDef {
	transitionSpeedMilliseconds: number
	outputOnConnect: boolean
	start: 'green' | 'red'
}

type ColorState = 'on' | 'off'
type State = 'green' | 'orange' | 'red' | 'red-orange'

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
						state === 'red' || state === 'red-orange' ? 'on' : 'off',
					),
					orange: getSingleLightStatePayload(
						state === 'orange' || state === 'red-orange' ? 'on' : 'off',
					),
					green: getSingleLightStatePayload(state === 'green' ? 'on' : 'off'),
				},
			})
		}

		const clearTransitionTimer = () => {
			if (transitionTimer) {
				clearTimeout(transitionTimer)
				transitionTimer = null
			}
		}

		const startTransition = () => {
			state = state === 'green' ? 'orange' : 'red-orange'
			sendCurrentStateCommand()
			transitionTimer = setTimeout(() => {
				state = state === 'orange' ? 'red' : 'green'
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
		})

		this.on('input', (message: any, _send, done) => {
			targetSimpleState =
				message.payload === 'on'
					? true
					: message.payload === 'off'
					? false
					: Boolean(message.payload)
			if (
				targetSimpleState !== currentSimpleState &&
				transitionTimer === null
			) {
				startTransition()
			}
			if (done) {
				done()
			}
		})
	}

	RED.nodes.registerType('traffic light', TrafficLightNode)
}
