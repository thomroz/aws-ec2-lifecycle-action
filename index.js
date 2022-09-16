import {
  EC2Client, CreateTagsCommand, RebootInstancesCommand, RunInstancesCommand,
  StartInstancesCommand, StopInstancesCommand, TerminateInstancesCommand
} from '@aws-sdk/client-ec2'

// Github Actions core
import * as core from '@actions/core'

try {
  const region = core.getInput('region')
  const stateVerb = core.getInput('state-verb')

  const instanceType = core.getInput('instance-type')
  const imageId = core.getInput('image-id')
  const templateId = core.getInput('template-id')
  const tags = core.getInput('tags')

  const instanceIds = core.getInput('instance-ids')

  if (stateVerb === 'tag') {
    let error = ''

    if (!instanceIds) {
      error += '\n-input instance-ids cannot be empty!'
    }

    if (!tags) {
      error += '\n-input tags cannot be empty!'
    }

    if (error !== '') {
      throw new Error(error)
    }

    tagInstances(region, instanceIds, tags)
  } else if (stateVerb === 'launch') {
    let error = ''

    if (!instanceType) {
      error += '\n-input instance-type cannot be empty!\n'
    }

    if (!imageId) {
      error += '-input image-id cannot be empty!\n'
    }

    if (!templateId) {
      error += '-input template-id cannot be empty!\n'
    }

    if (error !== '') {
      throw new Error(error)
    }

    const launchedId = await launchInstance(region, instanceType, imageId, templateId, tags)

    // set output
    core.setOutput('launched-id', launchedId)
  } else if (stateVerb === 'start') {
    if (!instanceIds) {
      throw new Error('\n-input instance-ids cannot be empty!')
    }

    startInstances(region, instanceIds)
  } else if (stateVerb === 'stop') {
    if (!instanceIds) {
      throw new Error('\n-input instance-ids cannot be empty!\n')
    }

    stopInstances(region, instanceIds)
  } else if (stateVerb === 'reboot') {
    if (!instanceIds) {
      throw new Error('\n-input instance-ids cannot be empty!\n')
    }

    rebootInstances(region, instanceIds)
  } else if (stateVerb === 'terminate') {
    if (!instanceIds) {
      throw new Error('\n-input instance-ids cannot be empty!\n')
    }

    terminateInstances(region, instanceIds)
  }
} catch (error) {
  core.setFailed(error.message)
}

async function tagInstances(region, instanceIds, tags) {
  const ec2Client = new EC2Client({ region })

  const command = new CreateTagsCommand({
    DryRun: false,
    Resources: JSON.parse(instanceIds),
    Tags: JSON.parse(tags)
  })

  await ec2Client.send(command)
}

async function launchInstance(region, instanceType, imageId, templateId, tags) {
  const ec2Client = new EC2Client({ region })

  const command = new RunInstancesCommand({
    InstanceType: instanceType,
    ImageId: imageId,
    LaunchTemplate: templateId,
    MinCount: 1,
    MaxCount: 1,
    TagSpecifications: [{
      ResourceType: 'instance',
      Tags: JSON.parse(tags)
    }]
  })

  const response = await ec2Client.send(command)
  const instanceId = response.Instances[0].InstanceId

  return instanceId
}

async function startInstances(region, instanceIds) {
  const ec2Client = new EC2Client({ region })

  const command = new StartInstancesCommand({
    DryRun: false,
    InstanceIds: JSON.parse(instanceIds)
  })

  await ec2Client.send(command)
}

async function stopInstances(region, instanceIds) {
  const ec2Client = new EC2Client({ region })

  const command = new StopInstancesCommand({
    DryRun: false,
    InstanceIds: JSON.parse(instanceIds)
  })

  await ec2Client.send(command)
}

async function rebootInstances(region, instanceIds) {
  const ec2Client = new EC2Client({ region })

  const command = new RebootInstancesCommand({
    DryRun: false,
    InstanceIds: JSON.parse(instanceIds)
  })

  await ec2Client.send(command)
}

async function terminateInstances(region, instanceIds) {
  const ec2Client = new EC2Client({ region })

  const command = new TerminateInstancesCommand({
    DryRun: false,
    InstanceIds: JSON.parse(instanceIds)
  })

  await ec2Client.send(command)
}
