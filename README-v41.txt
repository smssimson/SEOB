SMETRIC 통합 재배포 v41

중요: 이 ZIP 파일 이름은 반드시 site-update-SMETRIC-all-v41.zip 이어야 합니다.
현재 GitHub Actions(.github/workflows/deploy.yml)는 site-update-*.zip 파일만 사이트 통합 업데이트로 자동 인식합니다.
이전 재다운로드 파일명 SMETRIC_v40_4apps_REDOWNLOAD.zip은 자동배포 규칙에 해당하지 않습니다.

포함: 메인(index.html), 현장조사(survey), 도면작성(drawing), 장비조사(schmidt), 기울기(tilt), 서비스워커.
v40 화면 통일/기능 수정사항 유지. v41 배포 식별 메타태그와 서비스워커 캐시 버전 갱신.

업로드 방법: GitHub SEOB > Add file > Upload files > ZIP 자체 업로드 > Commit changes.
Actions 탭에서 SMETRIC deploy and ZIP cleanup 작업 완료 확인.
성공하면 자동배포 작업이 ZIP을 풀고 원본 ZIP을 저장소에서 삭제합니다.
기존 현장자료 JSON 백업 후 진행. 브라우저 캐시 문제 시 Ctrl+Shift+R / Ctrl+F5.

확인: ZIP 무결성 검사 및 JS 문법 검사. 실기기 펜/카메라/오프라인 PDF 기능은 별도 검증 필요.
