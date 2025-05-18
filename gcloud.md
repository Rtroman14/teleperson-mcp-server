## Login

gcloud auth application-default login
gcloud config set account rtroman14@gmail.com
gcloud config set project teleperson-453201

## Deploy (connected to github repo)

gcloud run deploy teleperson-mcp-server \
 --allow-unauthenticated \
 --region=us-central1 \
 --timeout=30s \
 --source=. \
 --env-vars-file=.env.yaml
