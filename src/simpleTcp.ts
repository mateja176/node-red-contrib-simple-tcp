/* eslint-disable immutable/no-mutation */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable immutable/no-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import net from 'net'
import { integer, number, parse, string } from 'valibot'
import type { NodeAPI, NodeDef, NodeMessage, Node as NodeRed } from 'node-red'

export default function (RED: NodeAPI) {
  function simpleTcp(
    this: NodeRed,
    def: NodeDef & Partial<{ port: string; host: string; timeout: string }>,
  ) {
    RED.nodes.createNode(this, def)

    this.on('input', (msg: NodeMessage) => {
      let host: string
      try {
        host = parse(string(), def.host)
      } catch (error) {
        return this.error('"host" is not defined.')
      }
      let port: number
      try {
        port = parse(number([integer()]), Number(def.port))
      } catch (error) {
        return this.error('"port" must be a valid integer.')
      }
      let timeout: number
      try {
        timeout = parse(number([integer()]), Number(def.timeout))
      } catch (error) {
        return this.error('"timeout" must be a valid integer.')
      }
      let payload: string
      try {
        payload = parse(string(), msg.payload)
      } catch (error) {
        return this.error('"payload" is not defined.')
      }

      const socket = new net.Socket()

      socket.connect(port, host, () => {
        socket.write(payload, (err) => {
          if (err) {
            socket.destroy()
            this.error(err)
          }
        })
      })

      socket.setTimeout(timeout)
      socket.on('timeout', () => {
        socket.destroy()
        this.error('Timed out while waiting for data.')
      })

      socket.on('error', (err) => {
        // * connection error or communication error
        socket.destroy()
        this.error(err)
      })

      socket.on('data', (data) => {
        socket.destroy()
        this.send({ ...msg, payload: data.toString() })
      })
    })
  }
  RED.nodes.registerType('simpleTcp', simpleTcp)
}
