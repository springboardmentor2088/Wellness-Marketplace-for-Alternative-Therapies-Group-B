# JWT Authentication System Implementation

## Plan:
1. [ ] Update pom.xml: Add Lombok dependency, change jjwt to 0.9.1
2. [ ] Update UserEntity.java: Add @Data, @NoArgsConstructor, @AllArgsConstructor Lombok annotations
3. [ ] Update RegisterRequest.java: Add @Data Lombok annotation
4. [ ] Update LoginRequest.java: Add @Data Lombok annotation (or update AuthDtos.java)
5. [ ] Create JwtUtil class: Use jjwt 0.9.1 API with methods generateToken(email), extractUsername(token), validateToken(token, email)
