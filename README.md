# Blockchain Game Lab

블록체인 수업 프로젝트용 로컬 Geth 테스트 환경입니다. 모바일 신분증 인증 결과를 바탕으로 게임장 접근 권한을 기록하고, 게임 플레이 결과를 트랜잭션으로 남기는 구조입니다.

## 준비

```powershell
npm install
Copy-Item .env.example .env
```

Geth는 설치되어 있어야 합니다. 현재 저장소는 `geth --dev` 기반 로컬 네트워크를 사용합니다.

## 로컬 Geth 실행

```powershell
npm run geth:start
```

RPC 주소는 `http://127.0.0.1:8545`, chain id는 `1337`입니다.

## 배포

Geth가 실행 중인 상태에서 새 터미널을 열고 실행합니다.

```powershell
npm run deploy:geth
```

배포 결과는 `deployments/gethLocal.json`에 저장됩니다.

## 샘플 트랜잭션 기록

```powershell
npm run record:sample
```

출력되는 트랜잭션 해시를 이용해 검증할 수 있습니다.

```powershell
npm run verify:tx -- <transaction-hash>
```

## 테스트

```powershell
npm test
```

## 핵심 파일

- `contracts/GameAccessLog.sol`: 접근 권한과 게임 기록 컨트랙트
- `scripts/geth/start-dev-geth.ps1`: 로컬 Geth 실행
- `scripts/deploy.ts`: 컨트랙트 배포
- `scripts/record-sample.ts`: 모바일 신분증 인증 결과와 게임 기록 샘플 트랜잭션
- `scripts/verify-tx.ts`: 트랜잭션 영수증, 블록, 로그 검증
- `src/auth/mobile-id.ts`: 모바일 신분증 검증 인터페이스와 mock 구현
- `src/blockchain/game-access-service.ts`: 백엔드에서 사용할 블록체인 연동 서비스

## 개인정보 주의

모바일 신분증 원문, 이름, 주민등록번호, 생년월일, 전화번호 같은 개인정보는 절대 온체인에 저장하지 않습니다. 컨트랙트에는 검증된 결과의 해시만 저장합니다.
