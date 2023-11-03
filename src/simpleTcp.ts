/* eslint-disable immutable/no-mutation */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable immutable/no-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import net from 'net'
import { integer, number, parse } from 'valibot'
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

    this.on('input', (msg) => {
      const host = 'host' in msg ? msg.host : def.host
      if (typeof host !== 'string' || !host) {
        return this.error('"host" must be a non-empty string.', msg)
      }
      let port: number
      try {
        port = parse(
          number([integer()]),
          Number('port' in msg ? msg.port : def.port),
        )
      } catch (error) {
        return this.error('"port" must be a valid integer.', msg)
      }
      let timeout: number
      try {
        timeout = parse(number([integer()]), Number(def.timeout))
      } catch (error) {
        return this.error('"timeout" must be a valid integer.', msg)
      }
      const { payload } = msg
      if (typeof payload !== 'string') {
        return this.error('"payload" must be a string.', msg)
      }

      const socket = new net.Socket()

      socket.connect(port, host, () => {
        socket.write(payload, (error) => {
          if (error) {
            socket.destroy()
            this.error(error.message, {
              ...msg,
              errorObject: error,
            } as NodeMessage)
          }
        })
      })

      socket.setTimeout(timeout)
      socket.on('timeout', () => {
        socket.destroy()
        this.error('Timed out while waiting for data.', msg)
      })

      socket.on('error', (error) => {
        // * connection error or communication error
        socket.destroy()
        this.error(error.message, { ...msg, errorObject: error } as NodeMessage)
      })

      socket.on('data', (data) => {
        socket.destroy()
        this.send({ ...msg, payload: data.toString() })
      })
    })
  }
  RED.nodes.registerType('simpleTcp', simpleTcp)
}
