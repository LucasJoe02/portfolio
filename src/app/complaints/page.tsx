import styles from "../page.module.css"
import React from "react"

export default function Page() {
    return (
      <div className={styles.container}>
        <div style={{ height: '50vh', width: '50vw'}}>
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            style={{
              border: 'none',
              height: '100%',
              width: '100%',
            }}
            allowFullScreen
            title="Rolled"
          />
        </div>
      </div>
    )
  }