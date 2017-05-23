
# Node.js app Docker file

FROM ubuntu:16.04
MAINTAINER Mondhs Bus "mondhs@gmail.com"

#docker build -t nodejs_kaldi_train_wrapper .
#docker run -p 8081:8081 -p 8082:8082 -it nodejs_kaldi_train_wrapper

RUN apt-get update
RUN apt-get install -y curl sudo
#RUN apt-get -y upgrade

RUN curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

COPY opt /opt

WORKDIR "/opt/wrapper"
RUN npm install ws --save
CMD ["npm", "start"]
