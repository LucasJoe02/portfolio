import styles from "./page.module.css"
import React from "react"

export default function Page() {
    return (
      <div className={styles.video}>
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Rolled"
        />
      </div>
    )
  }