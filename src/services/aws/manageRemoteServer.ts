import { Client } from 'ssh2'

interface SSHError {
  message: string
  status: string
}

const executeCommand = (
  instanceIP: string,
  userName: string,
  pemPath: string,
  command: string,
): Promise<{ message: string }> => {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn
      .on('ready', () => {
        conn.exec(command, (err: SSHError, stream: any) => {
          if (err) {
            conn.end()
            return reject(err)
          }

          stream
            .on('close', (code: any, signal = null) => {
              console.log(
                'Stream :: close :: code: ' + code + ', signal: ' + signal,
              )
              conn.end()

              if (code === 0) {
                resolve({ message: 'Main app started' })
              } else {
                reject({ message: 'Failed to start main app', code })
              }
            }) // Removed the .on('data') event listener
            .stderr.on('data', (data: any) => {
              console.log('STDERR: ' + data)
            })
        })
      })
      .connect({
        host: instanceIP,
        port: 22,
        username: userName,
        privateKey: require('fs').readFileSync(pemPath),
      })
  })
}

export const manageServer = (
  instanceIP: string,
  userName: string,
  pemPath: string,
  appName: string,
  action: 'start' | 'stop',
): Promise<{ message: string }> => {
  const command = `systemctl ${action} ${appName}`
  return executeCommand(instanceIP, userName, pemPath, command)
}
