import {expect, test} from '@oclif/test'

describe('unpublish', () => {
  test
  .stdout()
  .command(['unpublish'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['unpublish', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
