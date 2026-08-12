# Test Results - SWMS QC

Date: 2026-08-10
Environment: Windows, local server http://localhost:5500
Agent profile: .agents/qc-web.agent.md

## Execution Summary
- Front-end executed: 7
- Front-end pass: 3
- Front-end fail: 4
- White-box executed: 12
- White-box pass: 11
- White-box fail: 1

## Front-end Results

| ID | Status | Actual Result | Notes |
|---|---|---|---|
| FE-LOGIN-001 | PASS | thanhlv/admin1234567 login success, redirected to dashboard | Success toast displayed |
| FE-LOGIN-002 | FAIL | cuonglm/user1234567 blocked by client validation (password < 12 chars) | User exists and active in database but cannot login |
| FE-ROLE-001 | PASS | project_manager blocked from /employee-management and redirected to account dashboard | Role guard works |
| FE-RESOURCE-001 | FAIL | 404 for /pages/accountdashboard/style.css | Missing stylesheet path |
| FE-RESP-001 | FAIL | account dashboard overflow on mobile: overflowX=390 at width 375 | Horizontal scrolling appears |
| FE-RESP-002 | FAIL | personal dashboard overflow on mobile: overflowX=371 at width 375 | Horizontal scrolling appears |
| FE-FLOW-001 | PASS | logout returns to /index.html | Session cleared |

## White-box Results

Source: result/whitebox-tests.mjs
Raw output: result/whitebox-result.json
Clean JSON output: result/whitebox-result-clean.json

| ID | Status | Actual Result |
|---|---|---|
| WB-LOGIN-001 | PASS | findUserSignin returned active user thanhlv |
| WB-LOGIN-002 | PASS | inactive user viethq returned null |
| WB-AUTH-001 | PASS | current user saved/read correctly |
| WB-AUTH-002 | PASS | clearCurrentUser returned null state |
| WB-ROLE-001 | PASS | HR_MANAGER accepted for ADMIN alias |
| WB-ROLE-002 | PASS | EMPLOYEE rejected for PROJECT_MANAGER |
| WB-TASK-001 | PASS | insertTask created new task with auto code |
| WB-TASK-002 | PASS | updateTask updated status to Done |
| WB-TASK-003 | PASS | deleteTask returned true |
| WB-TASK-004 | PASS | deleteTask non-existent returned false |
| WB-PE-001 | FAIL | addProjectEmployee first insert returned null (expected created), duplicate also null |
| WB-PE-002 | PASS | invalid employeeCode returned null |

## Defect List

1) Defect ID: BUG-FE-001
- Type: Functional mismatch (login validation vs data)
- Severity: High
- Steps:
  - Open /index.html
  - Login with account cuonglm, password user1234567
- Expected: Login should succeed because account is active in user data.
- Actual: Blocked by regex requiring password length >= 12.
- Suspected Cause: Client-side rule in signin script conflicts with seeded user passwords in database.

2) Defect ID: BUG-FE-002
- Type: Resource loading
- Severity: Medium
- Steps:
  - Open /pages/accountdashboard/accountdashboard.html
- Expected: All CSS resources loaded 200.
- Actual: style.css returns 404.

3) Defect ID: BUG-FE-003
- Type: Responsive layout
- Severity: Medium
- Steps:
  - Open account dashboard at 375x812
- Expected: No horizontal scroll.
- Actual: overflowX=390.

4) Defect ID: BUG-FE-004
- Type: Responsive layout
- Severity: Medium
- Steps:
  - Open personal dashboard at 375x812
- Expected: No horizontal scroll.
- Actual: overflowX=371.

5) Defect ID: BUG-WB-001
- Type: White-box logic / data integration
- Severity: Medium
- Scenario:
  - addProjectEmployee("prj-001", "cuonglm", "Member") returned null at first add.
- Expected: first insert should create link, second insert should fail duplicate.
- Actual: both return null.
- Suspected Cause: project-employees module reads employee snapshot too early and uses employee codes inconsistent with seeded project links.

## Run Commands
- Start app: d:/SWMS/.venv/Scripts/python.exe -m http.server 5500
- Run white-box: node .\\result\\whitebox-tests.mjs > .\\result\\whitebox-result.json
