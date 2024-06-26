import AWS from 'aws-sdk';

export const manageEC2Instance = async (
  instanceId: string,
  action: 'start' | 'stop'
) => {
  const ec2 = new AWS.EC2({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const params = {
    InstanceIds: [instanceId]
  };

  if (action === 'start') {
    await ec2.startInstances(params).promise();
  } else if (action === 'stop') {
    await ec2.stopInstances(params).promise();
  }
};
