# aws-ec2-lifecycle-action

This action changes the lifecycle state of the specified AWS EC2 instance id.

## Inputs

## `region`

**Required** - The AWS region.

## `state-verb`

**Required** - Tag, launch, start, stop, reboot, terminate.

## `instance-type`

**Optional** - Required for launch.

## `image-id`

**Optional** - Required for launch.

## `template-id`

**Optional** - Required for launch.

## `instance-ids`

**Optional** - Array. Required for start, stop, reboot, terminate with no launch.

## `tags`

**Optional** - Array. Required for tag.  Key/Value pairs to add to the launched instance.

## Outputs

## `instance-id`

The launched AWS EC2 instance id.

## Example usage

```
on:
  - workflow_dispatch

env:
  REGION: us-west-2
  INSTANCE_TYPE: t4g.nano
  IMAGE_ID: ami-0ee02425a4c7e78bb
  TEMPLATE_ID: lt-0bcda70b83fe679ae

jobs:
  aws-ec2-lifecycle-job:
    runs-on: ubuntu-latest
    name: A job to launch, stop, and terminate an EC2 instance launched from a template
    steps:
      - name: configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1.7.0
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: launch instance
        id: launch
        uses: thomroz/aws-ec2-lifecycle-action@v1.0
        with:
          region: ${{ env.REGION }}
          state-verb: 'launch'
          instance-type: ${{ env.INSTANCE_TYPE }}
          image-id: ${{ env.IMAGE_ID }}
          template-id: ${{ env.TEMPLATE_ID }}
          tags: >
            [
              {"Key": "Name", "Value": "launched-spinal-tap-drummer"},
              {"Key": "foo", "Value": "bar"}
            ]

      - name: sleep
        run: |
          echo "${{ steps.launch.outputs.launched-id }}"
          sleep 45

      - name: tag instance
        id: tag
        uses: thomroz/aws-ec2-lifecycle-action@v1.0
        with:
          region: ${{ env.REGION }}
          state-verb: 'tag'
          instance-ids: >
            [
              "${{ steps.launch.outputs.launched-id }}"
            ]
          tags: >
            [
              {"Key": "FOOBAR", "Value": "YUP - FOOBARED"}
            ]

      - name: stop instance
        id: stop
        uses: thomroz/aws-ec2-lifecycle-action@v1.0
        with:
          region: ${{ env.REGION }}
          state-verb: 'stop'
          instance-ids: >
            [
              "${{ steps.launch.outputs.launched-id }}"
            ]

      - name: sleep
        run: |
          sleep 20

      - name: terminate instance
        id: terminate
        uses: thomroz/aws-ec2-lifecycle-action@v1.0
        with:
          region: ${{ env.REGION }}
          state-verb: 'terminate'
          instance-ids: >
            [
              "${{ steps.launch.outputs.launched-id }}",
            ]

```          