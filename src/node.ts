import * as NodeRED from 'node-red'

interface TrafficLightNodeConfiguration extends NodeRED.NodeDef {
	transitionSpeedMilliseconds: number
	outputOnConnect: boolean
}

type Color = 'red' | 'orange' | 'green'
type ColorCommand = 'on' | 'off'

export = function (RED: NodeRED.NodeAPI) {
	function TrafficLightNode(
		this: NodeRED.Node,
		configuration: TrafficLightNodeConfiguration,
	) {
		RED.nodes.createNode(this, configuration)

		const state = '@TODO'

		const sendColorCommand = (color: Color, command: ColorCommand) => {
			const on = command === 'on'
			const off = !on
			const message = { payload: command, on, off }
			this.send([
				color === 'red' ? message : null,
				color === 'orange' ? message : null,
				color === 'green' ? message : null,
			])
		}

		const sendCurrentStateCommand = () => {
			sendColorCommand('red', 'off')
			sendColorCommand('orange', 'off')
			sendColorCommand('green', 'on')
		}

		if (configuration.outputOnConnect) {
			setTimeout(() => {
				sendCurrentStateCommand()
			})
		}

		this.on('close', () => {
			// @TODO
		})

		this.on('input', (msg: any, send, done) => {
			msg.payload = msg.payload.message || 'Hello from Example Node'
			send([msg, null, { payload: 'third' }])
			if (done) done()
		})
	}

	RED.nodes.registerType('traffic light', TrafficLightNode)
}
