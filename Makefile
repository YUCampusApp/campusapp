.PHONY: dev backend frontend android install clean

# Variables
FE_DIR = frontend

# "make dev" starts the Spring Boot backend, the Vite frontend dev server, and deploys to the Android emulator all at once.
# By using -j 3, Make will run these 3 targets in parallel.
dev:
	@echo "Starting full CampusApp stack (Backend, Frontend, and Android Emulator)..."
	$(MAKE) -j 3 backend frontend android

backend:
	./mvnw spring-boot:run

frontend:
	cd $(FE_DIR) && npm run dev

android:
	cd $(FE_DIR) && npm run build && npx cap sync android && npx cap run android --target Medium_Phone_API_36.0

install:
	./mvnw clean compile
	cd $(FE_DIR) && npm install

clean:
	./mvnw clean
	cd $(FE_DIR) && rm -rf node_modules dist .vite

