curl -s -c cookies.txt -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -d '{"username":"<TEST_USERNAME>","password":"<TEST_PASSWORD>"}'
{"message":"User successfully logged in."}
