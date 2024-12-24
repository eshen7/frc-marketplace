FROM python:3.10-slim

# install pipenv for dependencies
RUN pip install --upgrade pip && pip install pipenv

WORKDIR /usr/local/app

# install python dependencies
COPY Pipfile* ./
RUN pipenv install --deploy

# copy the entire project
COPY . /usr/local/app/

# Expose port 8000 for the Daphne server
EXPOSE 8000

# Command to run Daphne
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "frc_marketplace_API.asgi:application"]