### API Reference
#### 암묵적으로 모든 API엔 AccessToken 파라미터가 숨겨져 있습니다.

## Global
* Session 만료

```
{
  "code": 3,
  "message": "session expired"
}
```

* 토큰이 틀릴 경우

```
{
  "code": 4,
  "message": "Invalid Token"
}
```


* 토큰이 없을 경우

```
{
  "code": 5,
  "message": "Invalid Access"
}
```

-------------------------------------

## /login - **POST**
###Parameter
* userId - 아이디
* password - 비밀번호

### Response
	
* **정상처리**

```
{
  "user": {
    "userId": "2014112025",
    "name": "권민준",
    "major": "컴퓨터공학전공",
    "password": "909b6b1a756cb702921a5a6129a31246d687ae08",
    "type": 0
  },
  "accessToken": {
    "uid": "2014112025",
    "token": "1421d8c06fc215b388f870b03400e507",
    "createdAt": "2015-12-07 06:16:14",
    "expiredAt": "2015-12-07 06:46:14"
  }
}
```

* 아이디를 입력하지 않았을 경우

```
{
  "code": 10,
  "message": "No userId"
}
```

* 비밀번호를 입력하지 않았을 경우

```
{
  "code": 10,
  "message": "No password"
}
```

* 비밀번호를 틀렸을 경우

```
{
  "code": 12,
  "message": "no match password"
}
```

-------------------------------------
## /join - **POST**
###Parameter
* userId - 아이디
* password - 비밀번호			
* name - 이름 [optional]
* major - 전공 [optional]
* type - 0: 학생 / 1: 교수 / 2: 관리자
###Response

* **정상처리**

```
{
  "userId": "2014112072",
  "password": "2e79a0d3744be7f8ce7a7d37709d034b4208830d",
  "major": "컴퓨터공학전공",
  "name": "이장행",
  "type": "0"
}
```

* 유저가 이미 있을 경우
			
```
	{
	  "code": 11,
	  "message": "user exist"
	}
```

* 비밀번호를 입력하지 않았을 경우
	
```
{
  "code": 10,
  "message": "No password"
}
```

* 아이디를 입력하지 않았을 경우

```
{
  "code": 10,
  "message": "No userId"
}
```

-------------------------------------
## /lecture_outline - **GET**
###Parameter
* **NO Parameter**
	
###Response

* **정상처리**

```
{
  "version": 1,
  "URL": "https://cdn.jsdelivr.net/gh/DyoonDyoon/Back-End/script/json/1.json"
}
```

-------------------------------------

## /lecture - **GET**
* 수강중인 강의 목록 불러오기

### Parameter

* userId - 불러올 강의목록의 소유자 (수강생, 교수)

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 07:32:10",
    "expiredAt": "2015-12-07 08:02:10"
  },
  "content": [
    {
      "id": 1,
      "lectureId": "CSE2020-02",
      "userId": "2014112025"
    }
  ]
}
```

* userId를 주지 않았을 경우

```
{
  "code": 10,
  "message": "no user id"
}
```
		
-------------------------------------

## /lecture - **POST**
* 수강신청

### Parameter

* userId - 수강신청 주체 (사용자)
* lectureId - 수강신청 강의

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 07:29:22",
    "expiredAt": "2015-12-07 07:59:22"
  },
  "message": "Success for post Lecture"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'user id' or 'lecture id'"
}
```
		
-------------------------------------

## /lecture - **DELETE**
* 강의 드랍

### Parameter

* userId - 드랍희망자 (사용자)
* lectureId - 드랍할 강의 아이디

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 07:38:06",
    "expiredAt": "2015-12-07 08:08:06"
  },
  "message": "Success to delete lecture"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'user id' or 'lecture id'"
}
```
		
-------------------------------------

## /assignment - **GET**
* 과제 가져오기

### Parameter

* lectureId - 수강신청 강의
* version - 클라이언트가 가진 강의 버전

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:07:34",
    "expiredAt": "2015-12-07 08:37:34"
  },
  "assignVer": 3,
  "content": [
    {
      "id": 1,
      "assignId": 1,
      "lectureId": "CSE2020-02",
      "title": "test assignment title",
      "description": "test assignment description",
      "filePath": null,
      "startDate": null,
      "endDate": null,
      "type": 0,
      "targetId": null
    },
    {
      "id": 2,
      "assignId": 2,
      "lectureId": "CSE2020-02",
      "title": null,
      "description": null,
      "filePath": null,
      "startDate": null,
      "endDate": null,
      "type": 1,
      "targetId": 1
    },
    {
      "id": 3,
      "assignId": 3,
      "lectureId": "CSE2020-02",
      "title": null,
      "description": null,
      "filePath": null,
      "startDate": null,
      "endDate": null,
      "type": 2,
      "targetId": 1
    }
  ]
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no lecture id"
}
	or
{
  "code": 10,
  "message": "no version"
}
```
		
-------------------------------------

## /assignment - **POST**
* 과제 공지

### Parameter

* lectureId - 과제 공지할 강의
* title - 과제 제목
* description - 과제 상세설명
* filePath - 파일 이름
* startDate - 과제 시작일
* endDate - 과제 마감일

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 07:55:15",
    "expiredAt": "2015-12-07 08:25:15"
  },
  "assignVer": 1,
  "message": "Success for post assignment"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'title' or 'lecture id'"
}
```
		
-------------------------------------

## /assignment - **PUT**
* 과제 수정

### Parameter

* lectureId - 과제 수정할 강의
* assignId - 수정할 과제 아이디
* title  - 수정된 과제 제목 [optional]
* description - 수정된 과제 상세 설명 [optional]
* filePath - 수정된 파일 이름 [optional]
* startDate - 과제 시작일 [optional]
* endDate - 과제 마감일 [optional]

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:01:54",
    "expiredAt": "2015-12-07 08:31:54"
  },
  "assignVer": 2,
  "message": "Success for update assignment"
}
```

* 없는 아이디를 통해 과제를 수정하려 접근했을 경우

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:02:13",
    "expiredAt": "2015-12-07 08:32:13"
  },
  "message": "no created assignment"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'assign id' or 'lecture id'"
}
```
		
-------------------------------------

## /assignment - **DELETE**
* 과제 공지

### Parameter

* lectureId - 삭제할 과제를 가진 강의 아이디
* assignId - 삭제할 과제 아이디

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:04:58",
    "expiredAt": "2015-12-07 08:34:58"
  },
  "assignVer": 3,
  "message": "Success for delete assignment"
}
```

* 없는 과제를 삭제하려 시도할 경우

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:06:13",
    "expiredAt": "2015-12-07 08:36:13"
  },
  "message": "no created assignment"
}
```

* 이미 삭제된 과제를 지우려 시도할 경우

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:05:16",
    "expiredAt": "2015-12-07 08:35:16"
  },
  "message": "already deleted"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'assign id' or 'lecture id'"
}
```
		
-------------------------------------

## /submit - **GET**
* 과제 받아오기

### Parameter
* lectureId : 해당 과제가 있는 강의 아이디
* assignId : 과제 아이디
* stuId : (학생용) 학생 아이디 넘겨주어 학생의 것만 받아오기

### Response
* **정상처리**

```
case 1 - stuId : 2014112025
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:59:30",
    "expiredAt": "2015-12-07 09:29:30"
  },
  "content": [
    {
      "submitId": 2,
      "lectureId": "CSE2020-02",
      "assignId": 5,
      "stuId": "2014112025",
      "filePath": null
    }
  ]
}
case 2 - stuId : null
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:00:14",
    "expiredAt": "2015-12-07 09:30:14"
  },
  "content": [
    {
      "submitId": 2,
      "lectureId": "CSE2020-02",
      "assignId": 5,
      "stuId": "2014112025",
      "filePath": null
    },
    {
      "submitId": 3,
      "lectureId": "CSE2020-02",
      "assignId": 5,
      "stuId": "2014112072",
      "filePath": null
    }
  ]
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'lecture id' or 'assignment id'"
}
```
		
-------------------------------------

## /submit - **POST**
* 과제 제출하기

### Parameter
* lectureId - 과제가 있는 강의 아이디
* assignId - 과제 아이디 (강의 내에서 유니크함)
* stuId - 과제의 주인 (학생)
* filePath - 과제 파일 이름

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 08:37:27",
    "expiredAt": "2015-12-07 09:07:27"
  },
  "message": "Success for post submit"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no lecture id"
}
	or
{
  "code": 10,
  "message": "no assignment id"
}
	or
{
  "code": 10,
  "message": "no student id"
}
```
		
-------------------------------------

## /submit - **PUT**
* 과제 수정하기

### Parameter
* submitId - 수정할 과제 아이디
* filePath - 수정할 파일 이름

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:13:35",
    "expiredAt": "2015-12-07 09:43:35"
  },
  "message": "Success for update submit!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'file path' or 'submit id'"
}
```
		
-------------------------------------

## /submit - **DELETE**
* 과제 삭제하기

### Parameter
* submitId - 삭제할 과제 아이디

### Response

* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:16:56",
    "expiredAt": "2015-12-07 09:46:56"
  },
  "message": "Success for delete submit!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no submit id"
}
```

		
-------------------------------------

## /grade - **GET**
* 성적 찾기

### Parameter
#### ! 두 파라미터 중 적어도 하나 이상 존재해야함 !
* stuId - 성적을 찾는 학생 아이디
* lectureId - 성적을 가진 강의 아이디

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:31:54",
    "expiredAt": "2015-12-07 10:01:54"
  },
  "content": [
    {
      "gradeId": 1,
      "submitId": 1,
      "lectureId": "CSE2020-02",
      "stuId": "2014112025",
      "score": 0
    }
  ]
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'lecture id' & 'student id'"
}
```
		
-------------------------------------


## /grade - **POST**
* 성적 부여하기

### Parameter
* lectureId - 성적을 부여할 과제를 가진 강의 아이디
* submitId - 성적을 부여할 과제
* stuId - 과제의 주인 (학생)
* score - 점수

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:31:32",
    "expiredAt": "2015-12-07 10:01:32"
  },
  "message": "Success for post grade"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no lecture id"
}
	or
{
  "code": 10,
  "message": "no submit id"
}
	or
{
  "code": 10,
  "message": "no student id"
}
```
		
-------------------------------------

## /grade - **PUT**
* 성적 수정하기

### Parameter
* gradeId - 수정할 성적 아이디
* score - 수정할 성적

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:35:26",
    "expiredAt": "2015-12-07 10:05:26"
  },
  "message": "Success for update grade!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no grade id"
}
	or
{
  "code": 10,
  "message": "no score"
}
```
		
-------------------------------------

## /grade - **DELETE**
* 성적 삭제하기

### Parameter
* gradeId - 삭제할 성적 아이디

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:36:11",
    "expiredAt": "2015-12-07 10:06:11"
  },
  "message": "Success for delete grade!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no grade id"
}
```
		
-------------------------------------

## /notification - **GET**
* 공지 가져오기

### Parameter
* lectureId - 공지사항이 등록된 강의 아이디
* version - 클라이언트에 저장되어있는 공지사항 업데이트 버전

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:58:12",
    "expiredAt": "2015-12-07 10:28:12"
  },
  "notiVer": 1,
  "content": [
    {
      "id": 1,
      "notiId": 1,
      "lectureId": "CSE2020-02",
      "title": "test notification title",
      "description": "test notification description",
      "type": 0,
      "targetId": null
    }
  ]
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no lecture id"
}
	or
{
  "code": 10,
  "message": "no version"
}
```
		
-------------------------------------

## /notification - **POST**
* 공지 올리기

### Parameter
* lectureId - 공지를 올릴 강의 아이디
* title - 공지사항 제목
* description - 공지사항 내용

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:57:07",
    "expiredAt": "2015-12-07 10:27:07"
  },
  "notiVer": 1,
  "message": "Success for post notification"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'title' or 'lecture id'"
}
```
		
-------------------------------------

## /notification - **PUT**
* 공지사항 수정

### Parameter
* lectureId - 수정할 공지사항이 올라가있는 강의 아이디
* notiId - 수정할 공지사항 아이디
* title - 수정할 제목
* description - 수정할 내용

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:59:08",
    "expiredAt": "2015-12-07 10:29:08"
  },
  "notiVer": 2,
  "message": "Success for update notification"
}
```

* 없는 공지를 수정하려 시도할 경우

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:59:34",
    "expiredAt": "2015-12-07 10:29:34"
  },
  "message": "no created notification"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'lecture id' or 'notification id'"
}
```
		
-------------------------------------

## /notification - **DELETE**
* 공지사항 삭제

### Parameter
* lectureId - 삭제할 공지가 올라가 있는 강의 아이디
* notiId - 삭제할 공지 아이디

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:00:36",
    "expiredAt": "2015-12-07 10:30:36"
  },
  "notiVer": 3,
  "message": "Success for delete notification"
}
```

* 없는 공지를 삭제하려 시도할 경우

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 09:59:48",
    "expiredAt": "2015-12-07 10:29:48"
  },
  "message": "no created notification"
}
```

* 이미 삭제된 공지를 지우려 시도할 경우

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:00:42",
    "expiredAt": "2015-12-07 10:30:42"
  },
  "message": "already deleted"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'lecture id' or 'notification id'"
}
```
		
-------------------------------------

## /question - **GET**
* 질문 가져오기

### Parameter
#### ! 두 파라미터 중 적어도 하나 이상 존재해야함 !
* stuId - 질문자 아이디 (학생)
* lectureId - 질문한 강의

### Response
* **정상처리**

```
case 1 - lectureId : CSE2020-02
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:18:23",
    "expiredAt": "2015-12-07 10:48:23"
  },
  "content": [
    {
      "questionId": 1,
      "lectureId": "CSE2020-02",
      "stuId": "2014112025",
      "content": "과제는 언제쯤 끝날까요?"
    },
    {
      "questionId": 2,
      "lectureId": "CSE2020-02",
      "stuId": "2014112072",
      "content": "미니 이클래스 완성은 언제쯤인가요?"
    }
  ]
}
case 2 - stuId : 2014112025
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:17:55",
    "expiredAt": "2015-12-07 10:47:55"
  },
  "content": [
    {
      "questionId": 1,
      "lectureId": "CSE2020-02",
      "stuId": "2014112025",
      "content": "과제는 언제쯤 끝날까요?"
    }
  ]
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'lecture id' or 'student id'"
}
```
		
-------------------------------------


## /question - **POST**
* 질문하기

### Parameter
* lectureId - 질문할 강의
* stuId - 질문자 아이디 (학생)
* content - 질문 내용

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:16:59",
    "expiredAt": "2015-12-07 10:46:59"
  },
  "message": "Success for post question"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'lecture id' or 'student id' or 'content'"
}
```
		
-------------------------------------

## /question - **PUT**
* 질문 수정

### Parameter
* questionId - 수정할 질문 아이디
* content - 수정할 내용

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:20:14",
    "expiredAt": "2015-12-07 10:50:14"
  },
  "message": "Success for update question!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'question id' or 'content'"
}
```
		
-------------------------------------

## /question - **DELETE**
* 질문 삭제

### Parameter
* questionId - 삭제할 질문 아이디

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:20:59",
    "expiredAt": "2015-12-07 10:50:59"
  },
  "message": "Success for delete question!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no question id"
}
```
		
-------------------------------------

## /answer - **GET**
* 질문에 대한 답변 가져오기

### Parameter
* questionId - 질문 아이디

### Response
* **정상처리**

```
case 1 - 답변이 있을 경우
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:24:30",
    "expiredAt": "2015-12-07 10:54:30"
  },
  "content": {
    "answerId": 1,
    "questionId": 1,
    "content": "종강할 때까지 입니다. (어쩌면 종강이후에도..)"
  }
}
case 2 - 답변이 없을 경우
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:26:56",
    "expiredAt": "2015-12-07 10:56:56"
  },
  "content": "No answer"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no question id"
}
```
		
-------------------------------------


## /answer - **POST**
* 답변하기

### Parameter
* questionId - 질문할 강의
* content - 답변 내용

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:24:09",
    "expiredAt": "2015-12-07 10:54:09"
  },
  "message": "Success for post answer"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'question id' or 'content'"
}
```
		
-------------------------------------

## /answer - **PUT**
* 질문 수정

### Parameter
* questionId - 수정할 질문 아이디
* content - 수정할 내용

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:25:35",
    "expiredAt": "2015-12-07 10:55:35"
  },
  "message": "Success for update answer!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no 'answer id' or 'content'"
}
```
		
-------------------------------------

## /answer - **DELETE**
* 질문 삭제

### Parameter
* questionId - 삭제할 질문 아이디

### Response
* **정상처리**

```
{
  "accessToken": {
    "token": "06694d0f1312f0f738a1cf6d6a7a7eae",
    "updatedAt": "2015-12-07 10:26:08",
    "expiredAt": "2015-12-07 10:56:08"
  },
  "message": "Success for delete answer!"
}
```

* 파라미터가 비어있을 경우

```
{
  "code": 10,
  "message": "no answer id"
}
```
