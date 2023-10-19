#! /usr/bin/env esr

import { readFileSync } from 'fs'
import { join } from 'path'

process.stdin.on('data', (data) => {
  const html = readFileSync(
    join(__dirname, '..', 'src/simpleTcp.html'),
    'utf-8',
  ).replace('__REGISTER__', data.toString())

  process.stdout.write(html + '\n')
})
