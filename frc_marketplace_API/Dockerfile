FROM python:3.10-slim

# install pipenv for dependencies
RUN pip install --upgrade pip && pip install pipenv

WORKDIR /usr/local/app

# install python dependencies
COPY Pipfile* ./
RUN pipenv install --deploy --ignore-pipfile

# copy the entire project
COPY . /usr/local/app/