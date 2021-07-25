import { Logger } from './logger'

const logger = new Logger()

describe('custom logger', () => {
  test('create the logger and return it', () => {
    expect(logger).toMatchSnapshot()
  })
})
