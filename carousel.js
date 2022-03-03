class Carousel extends HTMLElement {
	constructor(srcs, width, height, themeColor) {
		super()
		this.attachShadow({mode: 'open'})

		this.themeColor = themeColor || this.getAttribute('theme-color')

		if (!srcs) {
			if (!this.hasAttribute('srcs'))
				throw new Error("The carousel needs the attribute srcs. It should an array of image sources or a string of sources separated by commas.\nExample:\n<zion-carousel srcs='img1.png, img2.png, img3.png' />\n😉\n")

			if (typeof this.getAttribute('srcs') == 'string') {
				srcs = this.getAttribute('srcs').split(',').map((attr) => {
					return attr.trim()
				})
			}
			else {
				srcs = this.getAttribute('srcs')
				if (!Array.isArray(srcs))
					throw new Error("The carousel needs the attribute srcs. It should an array of image sources or a string of sources separated by commas.\nExample:\n<zion-carousel srcs='img1.png, img2.png, img3.png' />\n😉\n")
			}
		}
		else {
			if (typeof srcs == 'string') {
				srcs = srcs.split(',').map((src) => {
					return src.trim()
				})
			}
			else if (!Array.isArray(srcs))
				throw new Error("The carousel needs the attribute srcs. It should an array of image sources or a string of sources separated by commas.\nExample:\n<zion-carousel srcs='img1.png, img2.png, img3.png' />\n😉\n")
		}

		const style = this.shadowRoot.appendChild(document.createElement('style'))
		style.textContent = /*css*/`
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
				-webkit-tap-highlight-color: transparent;
				user-select: none;
				-webkit-user-drag: none;
			}

			::-webkit-scrollbar {
				height: 0;
			}

			#wrapper {
				position: relative;
				width: ${ width || this.getAttribute('width') ? width || this.getAttribute('width') : '100%' };
				height: ${ height || this.getAttribute('height') ? height || this.getAttribute('height') : '100%' };
				margin: auto;
				background: ${ this.themeColor ? this.themeColor : '#09090990' };
				transition: .4s
			}

			#imgsWrapper {
				overflow: hidden;
				height: 100%;
				scroll-behavior: smooth;
				white-space: nowrap;
				padding: 0;
			}

			.arr{
				position: absolute;
				top: 0;
				width: 10%;
				height: 100%;
				border: none;
				outline: none;
				background: none;
				color: #ccc;
				font-size: 2em;
				cursor: pointer;
				transition: .1s;
			}

			#leftArr {
				left: 0;
				text-align: left;
				padding-left: 10px;
			}
			
			#leftArr:hover {
				background: linear-gradient(to left, transparent, ${ this.themeColor ? this.themeColor : '#09090990' });
			}

			#rightArr {
				right: 0;
				text-align: right;
				padding-right: 10px;
			}
			
			#rightArr:hover {
				background: linear-gradient(to right, transparent, ${ this.themeColor ? this.themeColor : '#09090990' });
			}

			#leftArr:active,
			#rightArr:active {
				font-size: 1.5em;
			}

		`
		this.showingIndex = 0

		const wrapper = this.shadowRoot.appendChild(document.createElement('div'))
		wrapper.id = 'wrapper'

		const div = wrapper.appendChild(document.createElement('div'))
		div.id = 'imgsWrapper'

		this.scrollToLeft = () => {
			if (this.showingIndex > 0)
				this.showingIndex--
			else {
				div.insertBefore(div.children[div.children.length - 1], div.children[this.showingIndex])
				div.style.scrollBehavior = 'unset'
				this.showingIndex++
				div.scrollTo(div.children[this.showingIndex].offsetLeft - div.offsetWidth / 2 + div.children[this.showingIndex].offsetWidth / 2, 0)
				this.showingIndex--
				div.style.scrollBehavior = 'smooth'
			}
			let child = div.children[this.showingIndex]
			div.scrollTo(child.offsetLeft - div.offsetWidth / 2 + child.offsetWidth / 2, 0)
		}

		this.scrollToRight = () => {
			if (this.showingIndex < srcs.length - 1)
				this.showingIndex++
			else {
				div.appendChild(div.children[0])
				div.style.scrollBehavior = 'unset'
				this.showingIndex--
				div.scrollTo(div.children[this.showingIndex].offsetLeft - div.offsetWidth / 2 + div.children[this.showingIndex].offsetWidth / 2, 0)
				this.showingIndex++
				div.style.scrollBehavior = 'smooth'
			}
			let child = div.children[this.showingIndex]
			div.scrollTo(child.offsetLeft - div.offsetWidth / 2 + child.offsetWidth / 2, 0)
		}

		for (let i = 0; i < srcs.length; i++) {
			let imgContainer = div.appendChild(document.createElement('div'))
			let img = imgContainer.appendChild(document.createElement('img'))

			imgContainer.style = `
				margin: 0;
				border-radius: .5rem;
				display: inline-block;
				width: 100%;
				height: 100%;
				text-align: center;
				position: relative;
			`
			img.style = `
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				max-width: 100%;
				max-height: 100%;
			`

			img.setAttribute('src', srcs[i])

			img.onclick = () => {
				if (!sessionStorage.getItem('zionCarousel-isFullScreen')) {
					sessionStorage.setItem('zionCarousel-isFullScreen', 'true')
					wrapper.style.background = `${ this.themeColor ? this.themeColor : '#090909d8' }`
					let documentBody = document.documentElement.querySelector('body')
					let compBounding = this.getBoundingClientRect()

					const style = document.createElement('style')
					style.textContent = `
						#closeBt {
							position: fixed;
							right: 5px;
							top: 5px;
							width: 64px;
							height: 64px;
							background: transparent;
							color: #fff;
							font-size: 32px;
							font-weight: bolder;
							border: none;
							z-index: 99;
							cursor: pointer;
							opacity: .7;
						}

						#closeBt:hover {
							opacity: 1;
							transform: scale(1.05);
						}

						#closeBt:active {
							transform: scale(.95);
						}

						@keyframes carouselFadeIn{
							from {
								opacity: 0;
							}
							to {
								opacity: 1;
							}
						}

						@keyframes carouselFadeOut {
							from {
								opacity: 1;
							}
							to {
								opacity: 0;
							}
						}

						@keyframes carouselShow {
							from {
								top: ${ compBounding.y }px;
								left: ${ compBounding.x }px;
								width: ${ compBounding.width }px;
								height: ${ compBounding.height }px;
							}
							to {
								top: 0;
								left: 0;
								width: 100%;
								height: 100%;
							}
						}

						@keyframes carouselHide {
							from {
								top: 0;
								left: 0;
								width: 100%;
								height: 100%;
							}
							to {
								top: ${ compBounding.y }px;
								left: ${ compBounding.x }px;
								width: ${ compBounding.width }px;
								height: ${ compBounding.height }px;
							}
						}
					`
					let head = document.documentElement.querySelector('head')
					head.appendChild(style)

					let host = this.shadowRoot.host
					let spaceKeeper = host.parentElement.insertBefore(document.createElement('div'), host)
					spaceKeeper.style = `
						width: ${ compBounding.width }px;
						height: ${ compBounding.height }px;
					`

					this.style = `
						position: fixed;
						top: ${ compBounding.y }px;
						left: ${ compBounding.x }px;
						width: ${ compBounding.width }px;
						height: ${ compBounding.height }px;
						z-index: 99;
						animation: .4s ease-in-out carouselShow forwards;
					`

					wrapper.style.width = '100%'
					wrapper.style.height = '100%'

					let animating = true
					const fixScroll = () => {
						let child = div.children[this.showingIndex]
						div.scrollTo(child.offsetLeft - div.offsetWidth / 2 + child.offsetWidth / 2, 0)
						if (animating)
							requestAnimationFrame(fixScroll)
						else
							div.style.scrollBehavior = 'smooth'
					}
					div.style.scrollBehavior = 'unset'
					fixScroll()

					const removeFixScroll = () => {
						this.removeEventListener('animationend', removeFixScroll)
						animating = false
					}

					this.addEventListener('animationend', removeFixScroll)

					// let allCss = Array.from(document.styleSheets[0].cssRules).find(x => x.selectorText == '*')
					// if (allCss)
					// 	allCss.style.overflow = 'hidden'

					let closeBt = documentBody.appendChild(document.createElement('button'))
					closeBt.id = 'closeBt'
					closeBt.innerText = '\u2715'
					closeBt.style.animation = '.2s linear carouselFadeIn 1'

					const rmFullScreen = () => {

						let newCompBounding = spaceKeeper.getBoundingClientRect()
						Array.from(document.styleSheets[document.styleSheets.length - 1].cssRules).find(cr => cr.name == 'carouselHide')[1].style = `
						top: ${ newCompBounding.y }px;
						left: ${ newCompBounding.x }px;
						width: ${ newCompBounding.width }px;
						height: ${ newCompBounding.height }px;
						`

						animating = true
						div.style.scrollBehavior = 'unset'
						fixScroll()
						wrapper.style.background = `${ this.themeColor ? this.themeColor : '#09090990' }`

						closeBt.style.animation = '.2s linear carouselFadeOut 1 forwards'

						const rmCarousel = () => {
							if (spaceKeeper)
								host.parentElement.removeChild(spaceKeeper)
							animating = false
							this.removeEventListener('animationend', rmCarousel)
							sessionStorage.removeItem('zionCarousel-isFullScreen')
							// if (allCss)
							// 	allCss.style.overflow = ''
							this.style = ''
						}

						this.style.animation = '.4s ease-in-out carouselHide'
						this.addEventListener('animationend', rmCarousel)

						wrapper.style.width = ''
						wrapper.style.height = ''
					}

					closeBt.onclick = () => rmFullScreen()

					const kd = (e) => {
						switch (e.key) {
							case 'Escape':
								window.removeEventListener('keydown', kd)
								rmFullScreen()
								break
							case 'ArrowLeft':
								this.scrollToLeft()
								break
							case 'ArrowRight':
								this.scrollToRight()
								break
						}
					}
					window.addEventListener('keydown', kd)
				}
			}
		}

		const leftArr = wrapper.appendChild(document.createElement('button'))
		leftArr.id = 'leftArr'
		leftArr.classList.add('arr')
		leftArr.onclick = () => this.scrollToLeft()
		leftArr.innerText = '\u276E'

		const rightArr = wrapper.appendChild(document.createElement('button'))
		rightArr.id = 'rightArr'
		rightArr.classList.add('arr')
		rightArr.onclick = () => this.scrollToRight()
		rightArr.innerText = '\u276F'

		window.addEventListener('resize', () => {
			div.style.scrollBehavior = 'unset'
			let child = div.children[this.showingIndex]
			div.scrollTo(child.offsetLeft - div.offsetWidth / 2 + child.offsetWidth / 2, 0)
			div.style.scrollBehavior = 'smooth'
		})

		window.addEventListener('beforeunload', () => {
			sessionStorage.removeItem('zionCarousel-isFullScreen')
		})
	}

}

customElements.define('zion-carousel', Carousel)