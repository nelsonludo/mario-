kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5, /*the scale is for the size of the elements in the page*/
    debug: true, /*this is in case of any mistake*/
    clearColor:[0, 0.1, 0, 1],/*the bg color*/
})


    /*getting mario to move using the keyboard*/
    const MOVE_SPEED = 120 /*this is for his speed*/
    const JUMP_FORCE = 360 /*this is for his jump force*/
    const BIG_JUMP_FORCE = 410    
    let CURRENT_JUMP_FORCE = JUMP_FORCE
    let isJumping = true /*this is to destroy evil-shrooms*/
    const FALL_DEATH = 400

/*game image  : each image has the same path but different names the path should be put where specified only and the names too*/
loadRoot("https://i.imgur.com/")
loadSprite("coin", "wbKxhcd.png")
loadSprite("evil-shroom", "KPO3fR9.png")
loadSprite("brick", "M6rwarW.png")
loadSprite("block", "pogC9x5.png")
loadSprite("mario", "Wb1qfhK.png")
loadSprite("mushroom", "0wMd92p.png")
loadSprite("surprise", "gesQ1KP.png")
loadSprite("unboxed", "bdrLpi6.png")
loadSprite("pipe-top-left", "ReTPiWY.png")
loadSprite("pipe-top-right", "hj2GK4n.png")
loadSprite("pipe-bottom-left", "c1cYSbt.png")
loadSprite("pipe-bottom-right", "nqQ79eI.png")

loadSprite("blue-block", "fVscIbn.png")
loadSprite("blue-brick", "3e5YRQd.png")
loadSprite("blue-steel", "gqVoI2b.png")
loadSprite("blue-evil-shroom", "SvV4ueD.png")
loadSprite("blue-surprise", "RMqCc1G.png")


scene("game", ({ level, score }) => {
    layers(["bg", "obj", "ui"], "obj")


     /*this is the game's maps(apparatus) */
    const maps = [
        [
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '                                                  ',
            '      %     =*=%=                                 ',
            '                                                  ',
            '                                        -+        ',
            '                          ^    ^        ()        ',
            '====================================   ===========',
        ],

        [
            '£                                                    £',
            '£                                                    £',
            '£                                                    £',
            '£                                                    £',
            '£                                                    £',
            '£                                                    £',
            '£                                                    £',
            '£                                        x           £',
            '£                                      x x           £',
            '£     @@@@@q@@@@                     x x x           £',
            '£                                  x x x x           £',
            '£                                x x x x x    -+     £',
            '£                  z   z  x z  x x x x x x    ()     £',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ! ! ! ! !!!!!!!!!!!!!',
        ],
    ]
  
    /*configurating the components of the game by assigning symbols to them */
    const levelCfg = {
        width:20,
        height:20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()], /*the "body" component sets the gravity */
        '!': [sprite('blue-block'), solid(), scale(0.5)], 
        '£': [sprite('blue-brick'), solid(), scale(0.5)], 
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5),'dangerous', body()], 
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'], 
        'x': [sprite('blue-steel'), solid(), scale(0.5)],
        'q': [sprite('blue-surprise'), solid(), 'blue-mushroom-surprise', scale(0.5)],


    }

    const gameLevel = addLevel(maps[level], levelCfg)
  
    /*this is for  the score*/

    const scoreLabel = add([   /*this is set as a const so it can be used on the next levels*/
        text(score),
        pos(20, 65),
        layer('ui'), 
        {
            value: score,
        }
    ])

    add([text('-level ' + parseInt(level + 1)), pos(28,65)])


    /*This is what happens when mario becomes big or small*/
    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -=dt()
                    if (timer <= 0) {
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(1.5)
                timer = time
                isBig = true 
            }
        }
    }

    /*adding mario*/
    const player = add([
        sprite('mario'), solid(),
        pos(30, 0), /*giving him a static position */
        body(), /*make him fall to gravity */
        big(),
        origin('bot'), /*to prevent disturbances*/
    ])

    /*making the mushroom to move*/
    action('mushroom', (m) => {
        m.move(50, 0)
    })
 
    /*this is what happens when  mario hits his he d on     surpriseblock*/
    player.on('headbump', (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
        if (obj.is('blue-mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
    })

    /*making mario to become big */
    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(10)
    })

    /*making the score to increase as mario touches coin */
    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    /*to make the mushrooms move and all of its interractions with the player i.e kill or be killed like in "LA LOI DE LA JUNGLE" */
    const ENEMY_SPEED = 20

    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED, 0)
    })
    
    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
        } else {
        go('lose', { score: scoreLabel.value})
        }
    })

    /*this is to make the camera move with mario*/

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score : scoreLabel.value})

        }
    }) 

    player.collides('pipe', () => {
        keyDown('down', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })
    })

    /*making events on key press i.e making him jump when the space key is pressed for example*/
    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0) 
    })

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    player.action(() => {
        if(player.grounded()) {
            isJumping = false /* this means that if the player is on the ground when contact with the evil-shrooms is sent to the lose scene */
        }
    })

    keyPress('space', () => {
      if (player.grounded()) {
          isJumping = true
          player.jump(CURRENT_JUMP_FORCE, 0)
      }
    })
})

scene('lose', ({ score }) => {
    add([text('WASTED ☠ score : ' + score, 32), pos(width()/6, height()/ 2) ])
})

start("game", { level: 0, score : 0})