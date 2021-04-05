
//Должен быть реализован в виде поля ввода и кнопки “Загрузить”. 
//В поле можно ввести урл до картинки или  // Событие на загрузку из поля? 
// загрузить файл со списком картинок. Формат файла —JSON. 
//Можно использовать данный файл, сделать его копию на стороннем сервере или просто сохранить и загружать его с локального компьютера.
//Предусмотрите  возможность добавить картинку drag-n-drop в уже готовую загруженную галерею.
//Добавьте возможность удалить картинку из галереи.


//минимальная высота картинки
var min_height= 150;

//счетчик картинок
var fileCounter=0;


//событие при изменении ширины контейнера
let curWidth = document.getElementById('container').clientWidth;
window.addEventListener('resize', function(event){
	//добавить условие, что изменилась ширина контейнера
	if(document.getElementById('container').clientWidth != curWidth)
	{
		curWidth = document.getElementById('container').clientWidth;
		resize();
	}

});



//загрузка из строки по ссылке

// при нажатии Enter для IE 
var ua = window.navigator.userAgent.toLowerCase(),
is_ie = (/trident/gi).test(ua) || (/msie/gi).test(ua);


if (is_ie){
document.getElementById( "addImageInput" ).addEventListener('keyup', function(event) {
	if(event.keyCode == 13)
	{
		loadImgByUrl (event);
	}
});
}

// при  Изменении поля
document.getElementById( "addImageInput" ).onchange = function (e){
		loadImgByUrl(e);

	}
function loadImgByUrl(e) {

	let url = e.srcElement.value;
	if (url.length)
	{
		document.querySelector('.modal').classList.add('visible');
		fileCounter=0;
		var parts, ext = ( parts = url.split("/").pop().split(".") ).length > 1 ? parts.pop() : "";
		var access_ext = ['jpeg','jpg','png','gif'];

		if(access_ext.indexOf(ext) != -1)
		{
				createElement(url, 1);
		}
		else{
			document.querySelector('.modal').classList.remove('visible');
			alert ("Не верный формат ссылки на картинку. Допустимы ссылки на : "+access_ext)
		}
		document.getElementById( "addImageInput" ).value ="";
	}
};
//загрузка json по кнопке
window.addEventListener('load', function() {
  var file = document.getElementById('addFileButton');
  if (file) 
  {
    file.addEventListener('change', function() {
      if (file.files.length > 0) 
      {
		  document.querySelector('.modal').classList.add('visible');
           fileCounter=0;
		   jsonFilesCount=0;
			var parts, ext = ( parts = file.files[0].name.split("/").pop().split(".") ).length > 1 ? parts.pop() : "";
			
			if (ext === 'json')
			{
				
				let reader = new FileReader();
				reader.readAsText(file.files[0]); // будем читать только первый файл. В задании не было про мультизагрузку
				reader.onloadend = function() 
				{
					 var response = JSON.parse(reader.result);
					 if (typeof response.galleryImages == 'undefined'){
							alert ('Не верный формат файла JSON.');	
							 document.querySelector('.modal').classList.remove('visible');
							return;
						 }
					 jsonFilesCount += response.galleryImages.length;
					 response.galleryImages.forEach(function(item,i)
					 {
						createElement(item.url,(jsonFilesCount))
					 });
				}
			}
			else
			{
				document.querySelector('.modal').classList.remove('visible');
			 alert ('Файл должен быть JSON!');	
			}
      }
    });
  }
});



//////////////drag n drop//////////////
let cont = document.getElementById('images');
// убираем стандартное поведение при перестакивании
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName){
  cont.addEventListener(eventName, preventDefaults, false)   
  document.body.addEventListener(eventName, preventDefaults, false)
})
function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}


cont.addEventListener('drop', handleDrop, false)
function handleDrop(e) {
  var dt = e.dataTransfer
  var files = dt.files
  handleFiles(files)
}


function handleFiles(_files) {
	document.querySelector('.modal').classList.add('visible');
	fileCounter=0;
	var jsonFilesCount=0;
	const files = [];
	Array.prototype.push.apply(files, _files);
	//files = [...files]

	files.forEach(function(file,i)
	 {
		var parts, ext = ( parts = file.name.split("/").pop().split(".") ).length > 1 ? parts.pop() : "";
			let reader = new FileReader()
			var access_ext = ['jpeg','jpg','png','gif'];
			if (access_ext.indexOf(ext) != -1 || file.type == 'image/jpeg')
			{
				reader.readAsDataURL(file)
				reader.onloadend = function() 
				{
					createElement(reader.result,files.length)
				}
			}
			else if (ext == 'json'  )
			{
				

				reader.readAsText(file); 
				reader.onloadend = function() 
				{
					 var response = JSON.parse(reader.result);
					 jsonFilesCount += response.galleryImages.length;
					 response.galleryImages.forEach(function(item,i)
					 {
						createElement(item.url,(jsonFilesCount))
					 });
				}
			}
	});
}

// добавление елемента в контейнер
function createElement(url,imgCount/*, jsonFilesCount=''*/) {
	let newImg = document.createElement('img');
		newImg.src = url;
		newImg.style ='height: '+min_height+'px';
	let spanBlock = document.createElement('span');
		spanBlock.className = 'images-block__item';
	let newImgSpan = document.createElement('span');
		newImgSpan.className = 'images-block__delete-icon';
		newImgSpan.onclick = function () {
					this.parentElement.remove();
					resize ();
				};
	let cont = document.getElementById('images').appendChild(spanBlock);
		cont.appendChild(newImg);
		cont.appendChild(newImgSpan);
	newImg.onload = function() 
		{
			//можно проверить, что все картинки загружены и только потом перерасчитать, попутно показывать прелоадер
			fileCounter++;
			/*if (jsonFilesCount.lenght)
			{
				imgCount = imgCount * jsonFilesCount;
			}*/
			//console.log ('fileCounter',fileCounter,'imgCount' ,imgCount);
			if (fileCounter == imgCount)
			{
				
				document.querySelector('.modal').classList.remove('visible');
				resize ();
			}
		}
}

//изменение размера картинок 
function resize (){
	let row_id=0;
	let rowWidth=0;
	let firstImgInRow = 0;

	const imgs  = document.querySelectorAll('.images-block__item img');
	
	for(let i = 0; i < imgs.length; i++)
	{
		imgs[i].className = imgs[i].className.replace(/\brow_id_.*?\b/g, '');
		imgs[i].style.height = min_height+'px';		
	}
	

	for(let i = 0; i < imgs.length; i++)
	{

		if (i!==0 && imgs[i].offsetTop != imgs[i-1].offsetTop) 
		{
			
			for(let k = firstImgInRow; k < i; k++)
			{
				rowWidth += imgs[k].width
				imgs[k].classList.add('row_id_'+row_id);

			}
			const container_width = document.getElementById('container').clientWidth;

				//высота блока
				rowHeight = document.querySelector('.row_id_'+row_id).height;
				newHeight = (rowHeight/(rowWidth)*(container_width-2))//погрешность деления
				let imagesToResize  = document.querySelectorAll('.row_id_'+row_id);
				for(let i = 0; i < imagesToResize.length; i++)
				{
					imagesToResize[i].style.height = newHeight+'px';
					imagesToResize[i].style.width = 'auto';
				}
				
			firstImgInRow = i;
			row_id++;
			rowWidth=0;
		}
	}
}



//ie 11 support
(function () {
    var typesToPatch = ['DocumentType', 'Element', 'CharacterData'],
        remove = function () {
            // The check here seems pointless, since we're not adding this
            // method to the prototypes of any any elements that CAN be the
            // root of the DOM. However, it's required by spec (see point 1 of
            // https://dom.spec.whatwg.org/#dom-childnode-remove) and would
            // theoretically make a difference if somebody .apply()ed this
            // method to the DOM's root node, so let's roll with it.
            if (this.parentNode != null) {
                this.parentNode.removeChild(this);
            }
        };

    for (var i=0; i<typesToPatch.length; i++) {
        var type = typesToPatch[i];
        if (window[type] && !window[type].prototype.remove) {
            window[type].prototype.remove = remove;
        }
    }
})();


