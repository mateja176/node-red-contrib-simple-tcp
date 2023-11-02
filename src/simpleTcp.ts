/* eslint-disable immutable/no-mutation */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable immutable/no-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import net from 'net'
import { integer, number, parse, string } from 'valibot'
import type { NodeAPI, NodeDef, NodeMessage, Node as NodeRed } from 'node-red'

interface TcpConfig {
  port: string
  host: string
}
export default function (RED: NodeAPI) {
  function simpleTcp(
    this: NodeRed,
    def: NodeDef & Partial<TcpConfig & { timeout: string }>,
  ) {
    RED.nodes.createNode(this, def)

    this.on('input', (message: NodeMessage) => {
      const msg = message as NodeMessage & Partial<TcpConfig>
      const host = msg.host || def.host
      if (!host) {
        return this.error({ ...msg, payload: '"host" is not defined.' })
      }
      let port: number
      try {
        port = parse(number([integer()]), Number(msg.port || def.port))
      } catch (error) {
        return this.error({
          ...msg,
          payload: '"port" must be a valid integer.',
        })
      }
      let timeout: number
      try {
        timeout = parse(number([integer()]), Number(def.timeout))
      } catch (error) {
        return this.error({
          ...msg,
          payload: '"timeout" must be a valid integer.',
        })
      }
      let payload: string
      try {
        payload = parse(string(), msg.payload)
      } catch (error) {
        return this.error({ ...msg, payload: '"payload" is not defined.' })
      }

      const socket = new net.Socket()

      socket.connect(port, host, () => {
        socket.write(payload, (error) => {
          if (error) {
            socket.destroy()
            this.error({ ...msg, payload: error })
          }
        })
      })

      socket.setTimeout(timeout)
      socket.on('timeout', () => {
        socket.destroy()
        this.error({ ...msg, payload: 'Timed out while waiting for data.' })
      })

      socket.on('error', (error) => {
        // * connection error or communication error
        socket.destroy()
        this.error({ ...msg, payload: error })
      })

      socket.on('data', (data) => {
        socket.destroy()
        this.send({ ...msg, payload: data.toString() })
      })
    })
  }
  RED.nodes.registerType('simpleTcp', simpleTcp)
}
