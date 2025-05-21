import express from 'express'
import bodyParser from 'body-parser'
import pg from 'pg'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy } from 'passport-local'
import GoogleStrategy from 'passport-google-oauth2'
import session from 'express-session'
import env from 'dotenv'
import cors from "cors"

const app = express()
const saltRounds = 10
env.config()

app.use( 
    cors({
      origin:"http://localhost:5173",
      methods:["GET","POST","PUT","PATCH","DELETE"],
      credentials:true,
    })
  )

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
})
db.connect()

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
)

app.use(passport.initialize())
app.use(passport.session())
// chat----section
app.get("/api/contacts",async(req,res)=>{
    if(req.isAuthenticated){
    const email = req.query.email;
    console.log(email)
    const contacts = await db.query("SELECT * FROM users WHERE email != $1", [
      email,
    ]);
    res.send(contacts.rows);
  console.log(contacts.rows)}
    else{
      console.log("not");
    }
  })

app.post('/api/createAccount', async function (req, res) {
  const user = req.body.username
  const name = req.body.fullname
  const pass = req.body.password
  const cpass = req.body.cpassword
  console.log(req.body)
  try {
    const checkUsernname = await db.query(
      'SELECT * FROM users where username = $1',
      [user]
    ) // to check that user already exists or username not available

    if (checkUsernname.rows.length > 0) {
      res.status(400).send('Username already exists...')
    } else {
      console.log("creating user..")
      if (pass == cpass) {
        const hashedPass =await bcrypt.hash(pass, saltRounds, async (err, hash) => {
          if (err) {
            console.log(err)
          } else {
            const result = await db.query(
              'INSERT INTO users(fullname,username,password) VALUES ($1,$2,$3) RETURNING *',
              [name, user, hash]
            )
            const users = result.rows[0]
            req.login(users, err => {
              if (err) {
                console.log(err)
              } else {
                res.redirect('/')
              }
            })
          }
        })
      } else {
        res.status(400).send('Password do not match')
      }
    }
  } catch (error) {
    console.log(error)
  }
})

//Logging In
app.post('/loginUser',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true // Show error messages if login fails
  })
)

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

app.get('/auth/google/home',
  passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/'
  })
)

passport.use(
  new Strategy(async function verify (username, password, cb) {
    try {
      const checkUsernname = await db.query(
        'SELECT * FROM users where username = $1',
        [username]
      ) // to check that user already exists or not
      if (checkUsernname.rows.length > 0) {
        bcrypt.compare(
          password,
          checkUsernname.rows[0].password,
          (err, valid) => {
            // console.log(checkUsernname.rows[0].password)
            if (err) {
              //Error with password check
              console.error('Error comparing passwords:', err)
              return cb(err)
            } else {
              if (valid) {
                //Passed password check
                return cb(null, checkUsernname.rows[0])
              } else {
                //Did not pass password check
                return cb(null, false)
              }
            }
          }
        )
      } else {
        res.send('Username not exists...')
      }
    } catch (error) {
      console.log(error)
    }
  })
)

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/home'
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // console.log(profile);
        const result = await db.query('SELECT * FROM users WHERE email = $1', [
          profile.email
        ])
        if (result.rows.length === 0) {
          const newUser = await db.query(
            'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *',
            [profile.email, 'google', profile.displayName.replace(/\s/g, '.')]
          )
          return cb(null, newUser.rows[0])
        } else {
          return cb(null, result.rows[0])
        }
      } catch (err) {
        return cb(err)
      }
    }
  )
)

passport.serializeUser((user, cb) => {
  cb(null, user)
})
passport.deserializeUser((user, cb) => {
  cb(null, user)
})

const port = process.env.port || 3000

app.listen(port)