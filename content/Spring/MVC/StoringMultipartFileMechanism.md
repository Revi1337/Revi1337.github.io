분석 중......

DispatcherServlet#doDispatch
DispatcherServlet#checkMultipart
	StandardServletMultipartResolver#resolveMultipart
	
		StandardMultipartHttpServletRequest::new
		StandardMultipartHttpServletRequest#parseRequest
		
			HttpServletRequestWrapper#getParts
			RequestFacade#getParts() 세번 (무시가능)
			Request#getParts
			Request#parseParts (여기서 lazyResolve 를 false 를 설정하면 이미 parse 하였기 떄문에 return 을 하게 된다.)
		
			FileUploadBase#parseRequest
			DiskFileItemFactory#createItem (DiskFileItem 을 리턴하는 팩토리 메서드)
			DiskFileItem::new (Byte 정보를 메모리 혹은 파일에 저장할지 결정하는 객체)
			
			FileUploadBase#parseRequest 로 복귀
			Request#parseParts 로 복귀
			DiskFileItem#getString
			DiskFileItem#get
		
RequestMapppingHandlerAdapter#handleInternal(request, response, handlerMethod)
RequestMapppingHandlerAdapter#invokeHandlerMethod (여기서 HandlerMethodArgumentResolvers 들을 등록 (HandlerMethodArgumentResolver 들을 모아둔 HandlerMethodArgumentResolverComposite))

	ServletInvocableHandlerMethod#invokeAndHandle
	InvocableHandlerMethod#invokeForRequest
	InvocableHandlerMethod#getMethodArgumentValues
		반복문으로 Method 매개변수마다 HandlerMethodArgumentResolverComposite을 적용하여 결과값을 받아온다.
		한마디로 MultiPart 를 처리하는 RequestPartMethodArgumentResolver 도 실행된다.
		HandlerMethodArgumentArgumentResolverComposite#resolveArgument
		HandlerMethodArgumentArgumentResolverComposite#getArgumentResolver
			파라미터들을 순회하며 현재 파라미터를 처리할 수 있는 ArgumentResolver 룰
			HandlerMethodArgumentResolverComposite에서 찾고 이를 Resolve한다.
			...
			RequestPartMethodArgumentResolver#supportsParameter
			RequestPartMethodArgumentResolver#resolveArgument
				RequestPartServletServerHttpRequest::new
					StandardMultipartHttpServletRequest#getMultipartHeaders
					StandardMultipartHttpServletRequest#getPart
						Request#getPart
						Request#getParts
						Request#parseParts
						반복문을 통해 Parts 들 중, 파라미터 이름명과 같은 Part 를 조회
					Part 정보로 HttpHeader 를 구성한다. (content-disposition 과 같은..)
				AbstractMessageConverterMethodArgumentResolver#readWithMessageConverters 
					Spring의 HttpMessageConverter 를 사용해 HTTP 요청 본문을 읽고 변환하는 역할을 한다.
					message = EmptyBodyCheckingHttpInputMessage::new
						RequestPartServletServerHttpRequest#getHeaders(multipart 헤더가져옴)
						RequestPartServletServerHttpRequest#getBody(InputStream 으로가져온다)
						RequestPartServletServerHttpRequest#retrieveServletPart
							ApplicationPrt 를 가져온다.
							Part 가 null 이 아니면 part 에서 InputStream 을 가져온다.
							여기서 Part 는 fileItem. 즉, DiskFileItem 이고 InputStream으로 가져옴
					갖고있는 HttpMessageConverter들을 순회하며 message를 변환할 수 있는 Converter 찾음
					현재 파라미터가 JSON을 요구하면 MappingJackson2HttpMessageConverter 가 찾아지며
					read() 메서드로 JSON 을 읽어온다.
				AbstractMessageConverterMethodArgumentResolver#validateIfApplicable
					여기서 @Valid, @Validated 를 검사하여 파라미터의 유효성을 검증한다.
				WebDataBinder#getBindingResult&&isBindExceptionRequired()로 오류가있는지 확인후 예외
				AbstractMessageConverterMethodArgumentResolver#adaptArgumentIfNecessary
					여기서 파라미터가 Optional 타입인지 확인하고 of 나 empty 를 반환
				
			
					
					
				
					
					
						
	
	
