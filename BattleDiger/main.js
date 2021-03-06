enchant()

let floor = 0

window.onload = function load() {
  const core = new Core(256, 192)
  core.fps = 10
  core.preload('./texture/map1.png', './texture/char1.png', './texture/back.png', './texture/effect1.png')
  core.onload = function() {
    const { field, object, collision, start, next, back } = maps[2]
    const obj = JSON.parse(JSON.stringify(object))
    const col = JSON.parse(JSON.stringify(collision))
    if (floor % 5 === 4) {
      obj[back[1]][back[0]] = 29
    }
    floor += 1

    const map = new Map(16,16)
    map.image = core.assets['./texture/map1.png']
    map.loadData(field)
    map.collisionData = col

    const forergoundMap = new Map(16,16)
    forergoundMap.image = core.assets['./texture/map1.png']
    forergoundMap.loadData(obj)

    const player = new Sprite(48,48)
    player.image = core.assets['./texture/char1.png']
    player.scale(0.33,0.33)
    player.x = (start[0]-1) * 16
    player.y = (start[1]-1) * 16

    player.isMoving = false
    // player.direction = 0
    // player.walk = 1
    player.addEventListener('enterframe', async function() {
      if (this.x === (next[0]-1) * 16 && this.y === (next[1]-1) * 16) {
        load()
      }
      // this.frame = this.direction * 3 + this.walk
      if (this.isMoving) {
        this.moveBy(this.vx, this.vy);
        /*if (!(core.frame % 3)) {
          this.walk++;
          this.walk %= 3;
        }*/
        if ((this.vx && this.x % 16 == 0) || (this.vy && this.y % 16 == 0)) {
          this.isMoving = false;
          // this.walk = 1;
        }
      } else {
        this.vx = this.vy = 0;
        if (core.input.left) {
          // this.direction = 1;
          this.vx = -16;
        } else if (core.input.right) {
          // this.direction = 2;
          this.vx = 16;
        } else if (core.input.up) {
          // this.direction = 3;
          this.vy = -16;
        } else if (core.input.down) {
          // this.direction = 0;
          this.vy = 16;
        }
        if (this.vx || this.vy) {
          const x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
          const y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 16;
          if (0 <= x && x < map.width && 0 <= y && y < map.height && !map.hitTest(x, y)) {
            this.isMoving = true;
            arguments.callee.call(this);
          } else if (0 <= x && x < map.width && 0 <= y && y < map.height && map.hitTest(x, y)) {
            if (map.collisionData[(this.y+this.vy)/16+1][(this.x+this.vx)/16+1]===2) {
              const textObj = {0:'ツルハシを使いますか?',1:'y:はい',2:'n:いいえ'}
              setBackGroundImage(core,stage,'./texture/back.png')
              setChoiceScene(stage, textObj)
              let key = ''
              while (key !== 'y' && key !== 'n') {
                core.pause()
                const rawKey = await awaitForKeydown(document)
                key = rawKey.key
              }
              core.resume()
              if (key === 'y') {
                map.collisionData[(this.y+this.vy)/16+1][(this.x+this.vx)/16+1]=0
                obj[(this.y+this.vy)/16+1][(this.x+this.vx)/16+1]=-1
                forergoundMap.loadData(obj)
              }
              for (let k in textObj) {
                stage.removeChild(stage.lastChild)
              }
              stage.removeChild(stage.lastChild)
            }
          }
        }
      }
    });

    core.rootScene.addEventListener('enterframe', function(e) {
      var x = Math.min((core.width  - 32) / 2 - player.x, 0); // playerの位置がマップ半分まで到達？
      var y = Math.min((core.height - 32) / 2 - player.y, 0);
      x = Math.max(core.width,  x + map.width)  - map.width; // playerの位置がマップ右端まで到達？
      y = Math.max(core.height, y + map.height) - map.height;
      stage.x = x; // stageの座標をセット
      stage.y = y;
    });

    const stage = new Group()
    stage.addChild(map)
    stage.addChild(player)
    stage.addChild(forergoundMap)
    core.rootScene.addChild(stage)
  }
  core.start()
}
