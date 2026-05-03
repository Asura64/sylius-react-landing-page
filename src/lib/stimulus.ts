import { Application } from '@hotwired/stimulus'
import CourseChatController from '../controllers/course_chat_controller'
import CourseTimelineController from '../controllers/course_timeline_controller'
import LandingPageController from '../controllers/landing_page_controller'

declare global {
  interface Window {
    __stimulusApplication?: Application
  }
}

const application = window.__stimulusApplication ?? Application.start()

if (!window.__stimulusApplication) {
  application.register('course-chat', CourseChatController)
  application.register('course-timeline', CourseTimelineController)
  application.register('landing-page', LandingPageController)
  window.__stimulusApplication = application
}

export default application
