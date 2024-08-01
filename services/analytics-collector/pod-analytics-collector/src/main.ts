//
// Copyright © 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { setMetadata } from '@hcengineering/platform'
import serverToken from '@hcengineering/server-token'

import config from './config'
import { createServer, listen } from './server'
import { Collector } from './collector'
import { registerLoaders } from './loaders'
import serverClient from '@hcengineering/server-client'

export const main = async (): Promise<void> => {
  setMetadata(serverToken.metadata.Secret, config.Secret)
  setMetadata(serverClient.metadata.Endpoint, config.AccountsUrl)
  setMetadata(serverClient.metadata.UserAgent, config.ServiceID)

  console.log('Analytics service')
  console.log(config.AccountsUrl)
  console.log(config.DbURL)
  console.log(config.SupportWorkspace)

  registerLoaders()

  const collector = new Collector()

  const app = createServer(collector)
  const server = listen(app, config.Port)

  const shutdown = (): void => {
    void collector.close()
    server.close(() => process.exit())
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('uncaughtException', (e) => {
    console.error(e)
  })
  process.on('unhandledRejection', (e) => {
    console.error(e)
  })
}