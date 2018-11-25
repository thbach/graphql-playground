yarn add aws-amplify aws-amplify-react aws-appsync aws-appsync-react bootstrap downshift graphql-tag lodash.clonedeep lodash.debounce lodash.get moment node-sass-chokidar npm-run-all react react-apollo react-click-n-hold react-custom-scrollbars react-d3-cloud react-dom react-scripts react-sizeme react-sound react-speech-recognition react-spinners react-tiny-popover reactstrap rxjs uuid
yarn add -D babel-core babel-eslint babel-runtime eslint-config-prettier eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-react eslint-plugin-standard prettier-eslint standard

export AWS_REGION=$(jq -r '.providers.awscloudformation.Region' amplify/#current-cloud-backend/amplify-meta.json)
echo $AWS_REGION

export USER_FILES_BUCKET=$(sed -n 's/.*"aws_user_files_s3_bucket": "\(.*\)".*/\1/p' src/aws-exports.js)
echo $USER_FILES_BUCKET

export GRAPHQL_API_ID=$(jq -r '.api[(.api | keys)[0]].output.GraphQLAPIIdOutput' ./amplify/#current-cloud-backend/amplify-meta.json)
echo $GRAPHQL_API_ID

export DEPLOYMENT_BUCKET_NAME=$(jq -r '.providers.awscloudformation.DeploymentBucketName' ./amplify/#current-cloud-backend/amplify-meta.json)
export STACK_NAME=$(jq -r '.providers.awscloudformation.StackName' ./amplify/#current-cloud-backend/amplify-meta.json)
echo $DEPLOYMENT_BUCKET_NAME
echo $STACK_NAME

install backend dependencies

sam package --template-file ./backend/deploy.yaml --s3-bucket $DEPLOYMENT_BUCKET_NAME --output-template-file packaged.yaml
export STACK_NAME_AIML="$STACK_NAME-extra-aiml"
sam deploy --template-file ./packaged.yaml --stack-name $STACK_NAME_AIML --capabilities CAPABILITY_IAM --parameter-overrides appSyncAPI=$GRAPHQL_API_ID s3Bucket=$USER_FILES_BUCKET --region $AWS_REGION

#Wait for the stack to finish deploying then retrieve the functions' ARN
export CHUCKBOT_FUNCTION_ARN=$(aws cloudformation describe-stacks --stack-name  $STACK_NAME_AIML --query Stacks[0].Outputs --region $AWS_REGION | jq -r '.[] | select(.OutputKey == "ChuckBotFunction") | .OutputValue')
export MOVIEBOT_FUNCTION_ARN=$(aws cloudformation describe-stacks --stack-name  $STACK_NAME_AIML --query Stacks[0].Outputs --region $AWS_REGION | jq -r '.[] | select(.OutputKey == "MovieBotFunction") | .OutputValue')
echo $CHUCKBOT_FUNCTION_ARN
echo $MOVIEBOT_FUNCTION_ARN

#Let's set up Lex. We will create 2 chatbots: ChuckBot and MovieBot. Execute the following commands to add permissions so Lex can invoke the chatbot related functions:
aws lambda add-permission --statement-id Lex --function-name $CHUCKBOT_FUNCTION_ARN --action lambda:\* --principal lex.amazonaws.com --region $AWS_REGION
aws lambda add-permission --statement-id Lex --function-name $MOVIEBOT_FUNCTION_ARN --action lambda:\* --principal lex.amazonaws.com --region $AWS_REGION

#Update the bots intents with the Lambda ARN:
jq '.fulfillmentActivity.codeHook.uri = $arn' --arg arn $CHUCKBOT_FUNCTION_ARN backend/ChuckBot/intent.json -M > tmp.txt ; cp tmp.txt backend/ChuckBot/intent.json; rm tmp.txt
jq '.fulfillmentActivity.codeHook.uri = $arn' --arg arn $MOVIEBOT_FUNCTION_ARN backend/MovieBot/intent.json -M > tmp.txt ; cp tmp.txt backend/MovieBot/intent.json; rm tmp.txt

#And, deploy the slot types, intents and bots:
aws lex-models put-slot-type --cli-input-json file://backend/ChuckBot/slot-type.json --region $AWS_REGION
aws lex-models put-intent --cli-input-json file://backend/ChuckBot/intent.json --region $AWS_REGION
aws lex-models put-bot --cli-input-json file://backend/ChuckBot/bot.json --region $AWS_REGION
aws lex-models put-slot-type --cli-input-json file://backend/MovieBot/slot-type.json --region $AWS_REGION
aws lex-models put-intent --cli-input-json file://backend/MovieBot/intent.json --region $AWS_REGION
aws lex-models put-bot --cli-input-json file://backend/MovieBot/bot.json --region $AWS_REGION