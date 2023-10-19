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
    def: NodeDef & Partial<{ port: number; host: string }>,
  ) {
    let host: string
    let port: number
    try {
      host = parse(string(), def.host)
      port = parse(number([integer()]), def.port)
    } catch (error) {
      return this.error(error)
    }

    RED.nodes.createNode(this, def)

    this.on('input', (msg: NodeMessage) => {
      let payload: string
      try {
        parse(string(), msg.payload)
      } catch (error) {
        return this.error(error)
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
