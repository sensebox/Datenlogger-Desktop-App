import {
  ArrowDown,
  CableIcon,
  ChevronLeft,
  DownloadIcon,
  Tag,
  UploadIcon,
} from "lucide-react"
import * as React from "react"
import { Link } from "react-router-dom"

export default function Help() {
  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <aside className="sticky top-0 left-0 z-10 w-52 h-screen bg-gray-50 border-r p-6 flex flex-col">
        {/* Zurück-Button */}
        <Link to="/home" className="flex items-center text-gray-700 hover:text-gray-900 mb-8">
          <ChevronLeft className="h-6 w-6 mr-2" />
          Zurück
        </Link>

        {/* Inhaltsverzeichnis */}
        <nav className="flex-1">
          <ol className="list-decimal list-inside space-y-4 text-blue-600">
            <li>
              <a href="#connect-section" className="hover:underline">
                Mit dem Gerät verbinden
              </a>
            </li>
            <li>
              <a href="#download-section" className="hover:underline">
                Daten herunterladen
              </a>
            </li>
            <li>
              <a href="#upload-section" className="hover:underline">
                Daten hochladen
              </a>
            </li>
            <li>
              <a href="#statuslabels-section" className="hover:underline">
                Erklärung der Statuslabels
              </a>
            </li>
          </ol>
        </nav>
      </aside>

      {/* Haupt-Container */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-4xl font-bold">Hilfe</h1>
        <p className="text-lg text-gray-600">
          Hier findest du Anleitungen, wie du dein Gerät anschließt, Daten herunterlädst und sie auf die openSenseMap lädst.
        </p>

        {/* Sektion: Mit dem Gerät verbinden */}
        <section id="connect-section" className="scroll-mt-20">
          <div className="bg-gray-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <CableIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-semibold">Mit dem Gerät verbinden</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Um deine senseBox mit dem PC zu verbinden und die Messdaten anzuzeigen, folge diesen Schritten:
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-700 mb-6">
              <li>senseBox mit dem PC verbinden und anschalten.</li>
              <li>"Gerät auswählen" klicken und im Dropdown die senseBox auswählen</li>
              <li>Informationen werden geladen und in der Tabelle angezeigt</li>
            </ul>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {[
                { src: "/images/tutorial/boardselection.png" },
                { src: "/images/tutorial/deviceselection.png" },
                { src: "/images/tutorial/overview.png" },
              ].map(({ src  }) => (
                <figure key={src} className="flex flex-col justify-between h-full">
                  <img
                    src={src}
                    className="w-full object-contain max-h-48 rounded-md shadow-sm"
                  />

                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Sektion: Daten herunterladen */}
        <section id="download-section" className="scroll-mt-20">
          <div className="bg-gray-50 border-l-4 border-yellow-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <DownloadIcon className="h-6 w-6 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-semibold">Daten herunterladen</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Um die Messdaten von deiner senseBox herunterzuladen, folge diesen Schritten:
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-700 mb-6">
              <li>In der Aktionsleiste den blauen "Download" Knopf drücken</li>
              <li>Datei wird lokal auf dem Gerät gespeichert.</li>
            </ul>
            <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-center">
              <img
                src="/images/tutorial/btnDownload.png"
                alt="Download Button"
                className="w-full object-contain max-h-32 rounded-md shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Sektion: Daten hochladen */}
        <section id="upload-section" className="scroll-mt-20">
          <div className="bg-gray-50 border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <UploadIcon className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-2xl font-semibold">Daten hochladen</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Um die Daten auf der openSenseMap hochzuladen, musst du mit deinem openSenseMap Account eingeloggt sein und die CSV-Datei vorher lokal auf deinem PC gespeichert haben.
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-700 mb-6">
              <li>Datei runterladen</li>
              <li>Mit openSenseMap Account einloggen</li>
              <li>Upload Button drücken</li>
            </ul>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {[
                { src: "/images/tutorial/btnLogin.png", caption: "Login" },
                { src: "/images/tutorial/osemLogin.png", caption: "Mit openSenseMap Account einloggen" },
                { src: "/images/tutorial/btnUpload.png", caption: "Upload Button drücken" },
              ].map(({ src, caption }) => (
                <figure key={caption} className="flex flex-col justify-between h-full">
                  <img
                    src={src}
                    alt={caption}
                    className="w-full object-contain max-h-48 rounded-md shadow-sm"
                  />
                  <figcaption className="mt-4 text-sm text-gray-500 text-center">
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Sektion: Erklärung der Statuslabels */}
        <section id="statuslabels-section" className="scroll-mt-20">
          <div className="bg-gray-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Tag className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-semibold">Erklärung der Statuslabels</h2>
            </div>
            <ul className="space-y-6">
              {[
                {
                  src: "/images/tutorial/ondevice.png",
                  alt: "Status auf Gerät",
                  text: "Die Datei ist auf der senseBox. Noch nicht auf deinem PC!",
                },
                {
                  src: "/images/tutorial/downloaded.png",
                  alt: "Status heruntergeladen",
                  text: "Die Datei ist auf deinem PC gespeichert, aber noch nicht hochgeladen.",
                },
                {
                  src: "/images/tutorial/uploaded.png",
                  alt: "Status hochgeladen",
                  text: "Die Datei ist auf deinem PC und erfolgreich auf die openSenseMap hochgeladen.",
                },
              ].map(({ src, alt, text }) => (
                <li key={alt}>
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <img
                      src={src}
                      alt={alt}
                      className="col-span-2 w-full object-contain rounded-md shadow-sm"
                    />
                    <p className="col-span-3 text-gray-700">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
