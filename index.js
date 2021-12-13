import * as THREE from 'three'

class ThreeEvent {
	// 存放通过Object3D.Id保存的元素对象和事件回调
	TargetList = {
		'click': {},
		'hover': {}
	}
	// 存放的是监听列表
	EventListeners = {}
	// 存放的是具体处理事件的方法
	listenerList = {}

	/**
	 * 初始化 传入
	 * @param {*} options 渲染的元素;摄像头
	 */
	constructor(options) {
		const { domElement, camera } = this.options = options

		// 直接引用 不用this
		const { TargetList, EventListeners, listenerList } = this

		// 添加事件到EventListeners中去
		Object.keys(TargetList).forEach((v, i) => {
			EventListeners[v] = {
				flag: false,
				listener: (targetList) => {
					// 给listenerList添加 具体事件处理方法
					listenerList[v](targetList);
				}
			}
		})

		// 为THREE.Object3D添加两个方法
		Object.assign(THREE.Object3D.prototype, {
			/**
			 * 进行监听
			 * @param {*} method click/hover
			 * @param {*} callback1 回调1 触发回调
			 * @param {*} callback2 回调2 hover的移出回调
			 */
			on: function (method) {
				// 如果EventListeners存在
				if (EventListeners.hasOwnProperty(method)) {
					console.log('回调', Array.from(arguments).slice(1))
					// 把此Object3D添加到事件存储对象中
					TargetList[method][this.id] = {
						object3d: this,
						// 把回调
						callback: Array.from(arguments).slice(1)
					};
					// 
					const eventListener = EventListeners[method]
					// 如果已经调用过listener方法 把需要监听的object3d元素传入了就不用再传
					if (!eventListener.flag) {
						eventListener.flag = true
						// 传入监听列表 this.TargetList[method] 得到的是某一个事件的对象id列表
						// 调用监听方法 绑定事件 进行监听
						eventListener.listener(TargetList[method])
					}
				} else {
					console.warn("There is no method called '" + method + "';")
				}
			},
			/**
			 * 事件解绑
			 * @param {*} method click/hover
			 */
			off: function (method) {
				if (!!method) {
					if (EventListeners.hasOwnProperty(method)) {
						delete TargetList[method][this.id]
					} else {
						console.warn("There is no method called '" + method + "';")
					}
				} else {
					for (var key in TargetList) {
						delete TargetList[key][this.id]
					}
				}
			}
		})

		/**
		 * object3d on mouse click 
		 * @param {*} targetList 
		 */
		this.listenerList.click = (targetList) => {
			let targetObject
			let obj

			// 初始化一个Raycaster
			const Mouse = new THREE.Raycaster()

			/**
			 * 点击
			 * @param {*} event 
			 * @returns 
			 */
			const click = (event) => {
				event.preventDefault()
				if (!targetList) return
				// 获取到需要监听的元素以及后代元素
				let list = this.getObjList(targetList) || []

				// 获取到鼠标在canvas中的位置
				const mouse = this.getPickPosition(event)
				// 射线
				Mouse.setFromCamera(mouse, camera)
				// 传入检测和射线相交的一组物体 得到结果
				const intersects = Mouse.intersectObjects(list)
				// 如果检查到了元素
				if (intersects.length > 0) { // mouse down trigger
					targetObject = intersects[0].object;
					obj = this.getEventObj(targetList, targetObject)
					// 如果obj存在第一个回调
					if (!!obj.callback[0]) {
						obj.callback[0](targetObject, event)
					}
				}
			}

			// 对canvas进行监听
			domElement.addEventListener('click', click, false)
		}
		// object3d on mouse hover
		this.listenerList.hover = (targetList) => {
			let targetObject
			let obj
			let Hover = false

			// 初始化射线
			const Mouse = new THREE.Raycaster()

			/**
			 * 移动事件
			 */
			const mousemove = (event) => {
				event.preventDefault()
				if (!targetList) return
				// 获取到需要监听的元素以及后代元素
				let list = this.getObjList(targetList) || []
				// 获取到鼠标在canvas中的位置
				const mouse = this.getPickPosition(event)
				Mouse.setFromCamera(mouse, camera)
				const intersects = Mouse.intersectObjects(list)
				if (intersects.length > 0) {
					if (Hover) return
					Hover = true
					targetObject = intersects[0].object;
					obj = this.getEventObj(targetList, targetObject)
					// 移入触发回调1
					if (!!obj.callback[0]) {
						obj.callback[0](targetObject, event)
					}
				} else {
					// 移出 触发第二个回调
					if (Hover && !!obj.callback[1]) {
						obj.callback[1](targetObject, event)
					}
					Hover = false
				}
			}
			// 对canvas进行监听
			domElement.addEventListener('mousemove', mousemove, false)
		}
	}

	/**
	 * 移除所有的事件
	 */
	removeAll () {
		for (var key in this.TargetList) {
			for (var id in this.TargetList[key]) {
				delete this.TargetList[key][id];
			}
		}
	}

	/**
	 * 传入被监听的元素对象列表，循环Key 得到 object3d
	 * @param {*} targetList 被监听的元素对象列表
	 * @returns 
	 */
	getObjList (targetList) {
		const list = [];
		for (var key in targetList) {
			const target = targetList[key].object3d;
			list.push(target);
		}
		return this.group2meshlist(list);
	}
	/**
	 * 获取后代所有的元素
	 * @param {*} list 
	 * @returns 
	 */
	group2meshlist (list) {
		var l = [];
		for (var i in list) {
			if (list[i].type === 'Group') {
				l = l.concat(group2meshlist(list[i].children));
			} else {
				l.push(list[i])
			}
		}
		return l;
	}

	/**
	 * 
	 * @param {*} targetList 元素对象列表
	 * @param {*} object3d 元素对象
	 * @returns 
	 */
	getEventObj (targetList, object3d) {
		return this.object2group(targetList, object3d);
	}

	/**
	 * 递归查找
	 * 如果被射线射中的元素的父元素或祖父元素存在于监听元素中的话 就返回其父元素或祖父元素
	 * @param {*} targetList 
	 * @param {*} object3d 
	 * @returns 
	 */
	object2group (targetList, object3d) {
		if (targetList[object3d.id]) {
			return targetList[object3d.id];
		} else {
			return object2group(targetList, object3d.parent)
		}
	}

	/**
	 * 获取鼠标位于canvas的位置
	 * @param {*} event 
	 * @returns 
	 */
	getCanvasRelativePosition (event) {
		const canvas = this.options.domElement
		const rect = canvas.getBoundingClientRect();
		// 解决canvas缩放问题
		return {
			x: ((event.clientX - rect.left) * canvas.width) / rect.width,
			y: ((event.clientY - rect.top) * canvas.height) / rect.height
		};
	}
	/**
	 * 把鼠标在canvas中的坐标进行转换
	 * @param {*} event 
	 * @returns 
	 */
	getPickPosition (event) {
		const canvas = this.options.domElement
		const pickPosition = new THREE.Vector2()
		const pos = this.getCanvasRelativePosition(event);
		pickPosition.x = (pos.x / canvas.width) * 2 - 1;
		pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y

		return pickPosition
	}
}

export default ThreeEvent