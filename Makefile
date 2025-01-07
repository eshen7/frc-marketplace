run: pull frontend docker

pull:
	git pull

frontend:
	cd vite-frontend && npm run build && cd ..

docker:
	docker-compose up --build -d
